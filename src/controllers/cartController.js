const Product = require('../models/Product');

// Available promotional coupons
const VALID_COUPONS = {
  WELCOME10: { code: 'WELCOME10', type: 'percentage', value: 10, description: '10% off your entire order' },
  SAVE20: { code: 'SAVE20', type: 'percentage', value: 20, description: '20% special discount' },
  FLAT15: { code: 'FLAT15', type: 'fixed', value: 15, description: '$15 off your purchase' }
};

// Render Cart Page
exports.getCart = (req, res) => {
  res.render('pages/cart', {
    title: 'Your Shopping Cart - Shopease',
    validCoupons: Object.values(VALID_COUPONS)
  });
};

// API: Synchronize LocalStorage Cart with Database (validates prices and stock)
exports.syncCart = async (req, res) => {
  try {
    const { items = [], coupon = null } = req.body;
    const validatedItems = [];
    let subtotal = 0;
    let totalQty = 0;

    for (const item of items) {
      const prodId = item.productId || item.product;
      if (!prodId) continue;
      const product = await Product.findById(prodId);
      if (product && product.stock > 0) {
        const qty = Math.min(Math.max(1, parseInt(item.quantity) || 1), product.stock);
        validatedItems.push({
          productId: product._id.toString(),
          product: product._id,
          name: product.name,
          slug: product.slug,
          image: product.thumbnail,
          price: product.price,
          originalPrice: product.originalPrice || product.price,
          brand: product.brand,
          quantity: qty,
          stock: product.stock
        });
        subtotal += product.price * qty;
        totalQty += qty;
      }
    }

    let discount = 0;
    let validCoupon = null;
    if (coupon && coupon.code && VALID_COUPONS[coupon.code.toUpperCase()]) {
      validCoupon = VALID_COUPONS[coupon.code.toUpperCase()];
      if (validCoupon.type === 'percentage') {
        discount = (subtotal * validCoupon.value) / 100;
      } else if (validCoupon.type === 'fixed') {
        discount = validCoupon.value;
      }
    }

    discount = parseFloat(Math.min(discount, subtotal).toFixed(2));
    const shipping = (subtotal > 50 || subtotal === 0) ? 0 : 9.99;
    const total = parseFloat(Math.max(0, subtotal - discount + shipping).toFixed(2));

    const syncedCart = {
      items: validatedItems,
      coupon: validCoupon,
      totalQty,
      subtotal: parseFloat(subtotal.toFixed(2)),
      discount,
      shipping,
      total
    };

    req.session.cart = syncedCart;
    return res.json({ success: true, cart: syncedCart });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Cart sync failed' });
  }
};

// Add item to cart (supports both AJAX JSON and Form POST)
exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const qty = Math.max(1, parseInt(quantity) || 1);

    const product = await Product.findById(productId);
    if (!product) {
      if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      return res.redirect('/shop?error=Product not found');
    }

    if (product.stock < 1) {
      if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.status(400).json({ success: false, message: 'Item is currently out of stock' });
      }
      return res.redirect(`/product/${product.slug}?error=Out of stock`);
    }

    const cart = req.session.cart;
    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      const newQty = cart.items[existingItemIndex].quantity + qty;
      cart.items[existingItemIndex].quantity = Math.min(newQty, product.stock);
    } else {
      cart.items.push({
        product: product._id,
        name: product.name,
        slug: product.slug,
        image: product.thumbnail,
        price: product.price,
        originalPrice: product.originalPrice,
        brand: product.brand,
        quantity: Math.min(qty, product.stock),
        stock: product.stock
      });
    }

    // Response for AJAX/Fetch
    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return res.json({
        success: true,
        message: `"${product.name}" added to your cart!`,
        cart: {
          totalQty: cart.items.reduce((sum, item) => sum + item.quantity, 0),
          subtotal: cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
        }
      });
    }

    res.redirect('/cart?success=Item added to cart');
  } catch (error) {
    next(error);
  }
};

// Update cart item quantity (AJAX or form)
exports.updateQuantity = async (req, res, next) => {
  try {
    const { productId, action, quantity } = req.body;
    const cart = req.session.cart;

    const item = cart.items.find(i => i.product.toString() === productId);
    if (!item) {
      if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.status(404).json({ success: false, message: 'Item not in cart' });
      }
      return res.redirect('/cart?error=Item not in cart');
    }

    const product = await Product.findById(productId);
    const maxStock = product ? product.stock : 99;

    if (action === 'increment') {
      if (item.quantity < maxStock) {
        item.quantity += 1;
      }
    } else if (action === 'decrement') {
      if (item.quantity > 1) {
        item.quantity -= 1;
      } else {
        cart.items = cart.items.filter(i => i.product.toString() !== productId);
      }
    } else if (quantity !== undefined) {
      const parsedQty = parseInt(quantity);
      if (parsedQty <= 0) {
        cart.items = cart.items.filter(i => i.product.toString() !== productId);
      } else {
        item.quantity = Math.min(parsedQty, maxStock);
      }
    }

    if (req.xhr || req.headers.accept?.includes('application/json')) {
      // Return fresh cart calculations
      return res.json({
        success: true,
        cart: req.session.cart
      });
    }

    res.redirect('/cart');
  } catch (error) {
    next(error);
  }
};

// Remove single item from cart
exports.removeFromCart = (req, res) => {
  const { productId } = req.params;
  req.session.cart.items = req.session.cart.items.filter(
    item => item.product.toString() !== productId
  );

  if (req.xhr || req.headers.accept?.includes('application/json')) {
    return res.json({ success: true, message: 'Item removed', cart: req.session.cart });
  }

  res.redirect('/cart?info=Item removed from cart');
};

// Clear entire cart
exports.clearCart = (req, res) => {
  req.session.cart.items = [];
  req.session.cart.coupon = null;
  res.redirect('/cart?info=Cart cleared');
};

// Apply coupon code
exports.applyCoupon = (req, res) => {
  const code = (req.body.couponCode || '').trim().toUpperCase();

  if (VALID_COUPONS[code]) {
    req.session.cart.coupon = VALID_COUPONS[code];
    return res.redirect(`/cart?success=Coupon "${code}" applied successfully!`);
  }

  res.redirect('/cart?error=Invalid coupon code. Try WELCOME10 or SAVE20');
};

// Remove coupon code
exports.removeCoupon = (req, res) => {
  req.session.cart.coupon = null;
  res.redirect('/cart?info=Coupon removed');
};
