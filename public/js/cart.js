/**
 * Shopease E-Commerce: Client-Side LocalStorage Cart Engine
 * 
 * Features:
 * - Persists cart state in browser localStorage ('shopease_cart_v1')
 * - Real-time badge counter synchronization across all tabs and pages
 * - Instant coupon calculation (SAVE20, WELCOME10, FLAT15)
 * - Dynamic event dispatching ('shopease:cart-updated')
 */

(function () {
  const STORAGE_KEY = 'shopease_cart_v1';

  const COUPONS = {
    SAVE20: { code: 'SAVE20', type: 'percentage', value: 20, description: '20% special discount' },
    WELCOME10: { code: 'WELCOME10', type: 'percentage', value: 10, description: '10% off your entire order' },
    FLAT15: { code: 'FLAT15', type: 'fixed', value: 15, description: '$15 off your purchase' }
  };

  const ShopeaseCart = {
    /**
     * Get parsed cart from localStorage
     */
    getCart: function () {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
          return this.getEmptyCart();
        }
        const parsed = JSON.parse(raw);
        return this.recalculate(parsed);
      } catch (err) {
        console.error('[ShopeaseCart] Error reading localStorage, resetting:', err);
        return this.getEmptyCart();
      }
    },

    getEmptyCart: function () {
      return {
        items: [],
        coupon: null,
        totalQty: 0,
        subtotal: 0,
        discount: 0,
        shipping: 0,
        total: 0
      };
    },

    /**
     * Recalculate financial totals
     */
    recalculate: function (cart) {
      if (!cart || !Array.isArray(cart.items)) {
        cart = this.getEmptyCart();
      }

      let totalQty = 0;
      let subtotal = 0;

      cart.items.forEach(function (item) {
        const qty = parseInt(item.quantity) || 1;
        const price = parseFloat(item.price) || 0;
        item.quantity = qty;
        item.price = price;
        totalQty += qty;
        subtotal += price * qty;
      });

      cart.totalQty = totalQty;
      cart.subtotal = parseFloat(subtotal.toFixed(2));

      // Calculate coupon discount
      let discount = 0;
      if (cart.coupon && cart.coupon.code) {
        if (cart.coupon.type === 'percentage') {
          discount = (subtotal * cart.coupon.value) / 100;
        } else if (cart.coupon.type === 'fixed') {
          discount = cart.coupon.value;
        }
      }
      cart.discount = parseFloat(Math.min(discount, subtotal).toFixed(2));

      // Free shipping threshold over $50
      cart.shipping = (cart.subtotal > 50 || cart.subtotal === 0) ? 0 : 9.99;
      cart.total = parseFloat(Math.max(0, cart.subtotal - cart.discount + cart.shipping).toFixed(2));

      return cart;
    },

    /**
     * Save cart to localStorage and notify DOM
     */
    saveCart: function (cart) {
      const recalculated = this.recalculate(cart);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recalculated));
      this.syncBadge(recalculated.totalQty);

      window.dispatchEvent(
        new CustomEvent('shopease:cart-updated', { detail: recalculated })
      );
      return recalculated;
    },

    /**
     * Add an item to the localStorage cart
     * @param {Object} product - { productId, name, price, originalPrice, image, slug, brand, stock }
     * @param {number} quantity - Quantity to add (default 1)
     */
    addItem: function (product, quantity) {
      const cart = this.getCart();
      const qtyToAdd = Math.max(1, parseInt(quantity) || 1);
      const maxStock = parseInt(product.stock) || 999;

      const existingIndex = cart.items.findIndex(function (item) {
        return item.productId === product.productId;
      });

      if (existingIndex > -1) {
        const currentQty = cart.items[existingIndex].quantity;
        cart.items[existingIndex].quantity = Math.min(currentQty + qtyToAdd, maxStock);
        if (product.price) cart.items[existingIndex].price = parseFloat(product.price);
      } else {
        cart.items.push({
          productId: product.productId,
          name: product.name,
          slug: product.slug || '',
          price: parseFloat(product.price) || 0,
          originalPrice: parseFloat(product.originalPrice) || 0,
          image: product.image || product.thumbnail || '',
          brand: product.brand || 'Shopease',
          quantity: Math.min(qtyToAdd, maxStock),
          stock: maxStock
        });
      }

      return this.saveCart(cart);
    },

    /**
     * Update quantity of an item directly
     */
    updateQuantity: function (productId, quantity) {
      const cart = this.getCart();
      const qty = parseInt(quantity);

      if (qty <= 0) {
        return this.removeItem(productId);
      }

      const item = cart.items.find(function (i) {
        return i.productId === productId;
      });

      if (item) {
        const maxStock = item.stock || 999;
        item.quantity = Math.min(qty, maxStock);
        return this.saveCart(cart);
      }
      return cart;
    },

    /**
     * Remove an item from cart
     */
    removeItem: function (productId) {
      const cart = this.getCart();
      cart.items = cart.items.filter(function (i) {
        return i.productId !== productId;
      });
      return this.saveCart(cart);
    },

    /**
     * Clear all items in cart
     */
    clearCart: function () {
      const empty = this.getEmptyCart();
      return this.saveCart(empty);
    },

    /**
     * Apply promotional coupon
     */
    applyCoupon: function (code) {
      const cleanCode = (code || '').trim().toUpperCase();
      if (!COUPONS[cleanCode]) {
        return { success: false, message: 'Invalid coupon code. Try SAVE20 or WELCOME10' };
      }
      const cart = this.getCart();
      cart.coupon = COUPONS[cleanCode];
      this.saveCart(cart);
      return { success: true, message: `Coupon "${cleanCode}" applied successfully!`, coupon: COUPONS[cleanCode] };
    },

    /**
     * Remove applied coupon
     */
    removeCoupon: function () {
      const cart = this.getCart();
      cart.coupon = null;
      this.saveCart(cart);
      return { success: true, message: 'Coupon removed' };
    },

    /**
     * Update navbar badge counter element
     */
    syncBadge: function (count) {
      if (typeof count === 'undefined') {
        const cart = this.getCart();
        count = cart.totalQty;
      }
      const badges = document.querySelectorAll('#cartCountBadge, .cart-count-badge');
      badges.forEach(function (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'inline-flex' : 'none';
      });
    },

    /**
     * Sync cart with server (e.g. before checkout)
     */
    syncWithServer: async function () {
      try {
        const cart = this.getCart();
        const res = await fetch('/api/cart/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: cart.items, coupon: cart.coupon })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.cart) {
            // Update prices / stock validated by database
            return this.saveCart(data.cart);
          }
        }
      } catch (err) {
        console.warn('[ShopeaseCart] Server sync failed (offline or server error):', err);
      }
      return this.getCart();
    }
  };

  // Expose globally
  window.ShopeaseCart = ShopeaseCart;

  // Auto-sync on page load
  document.addEventListener('DOMContentLoaded', function () {
    ShopeaseCart.syncBadge();
  });

  // Listen to cross-tab storage changes
  window.addEventListener('storage', function (e) {
    if (e.key === STORAGE_KEY) {
      ShopeaseCart.syncBadge();
      window.dispatchEvent(
        new CustomEvent('shopease:cart-updated', { detail: ShopeaseCart.getCart() })
      );
    }
  });
})();
