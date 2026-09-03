/**
 * Shopease Client-side Interactions & Micro-animations
 */

document.addEventListener('DOMContentLoaded', () => {
  initLiveSearch();
  initAjaxAddToCart();
  initWishlistToggle();
  initProductGallery();
  initQuantityStepper();
  initAutoDismissAlerts();
});

// Toast Notification Manager
function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// 1. Live Instant Search with Debounce
function initLiveSearch() {
  const searchInput = document.getElementById('mainSearchInput');
  const dropdown = document.getElementById('searchDropdownResults');
  if (!searchInput || !dropdown) return;

  let debounceTimer;

  searchInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    const query = e.target.value.trim();

    if (query.length < 2) {
      dropdown.style.display = 'none';
      dropdown.innerHTML = '';
      return;
    }

    debounceTimer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const items = await res.json();

        if (items && items.length > 0) {
          dropdown.innerHTML = items.map(item => `
            <a href="/product/${item.slug}" class="search-result-item">
              <img src="${item.thumbnail}" alt="${item.name}">
              <div class="search-result-info">
                <div class="name">${item.name}</div>
                <div class="price">$${item.price.toFixed(2)}</div>
              </div>
            </a>
          `).join('');
          dropdown.style.display = 'block';
        } else {
          dropdown.innerHTML = '<div style="padding: 1rem; color: #64748b; font-size: 0.85rem; text-align: center;">No matching products found</div>';
          dropdown.style.display = 'block';
        }
      } catch (err) {
        console.error('Live search error:', err);
      }
    }, 250);
  });

  // Close dropdown on outside click
  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.style.display = 'none';
    }
  });
}

// 2. AJAX Add to Cart with Badge Bump Animation
function initAjaxAddToCart() {
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('.ajax-add-cart-btn');
    if (!btn) return;

    e.preventDefault();
    const productId = btn.dataset.productId;
    const qtyInput = document.querySelector('.stepper-input');
    const quantity = qtyInput ? parseInt(qtyInput.value) || 1 : 1;

    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `
      <svg class="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
        <path d="M12 2a10 10 0 0 1 10 10"></path>
      </svg>
      Adding...
    `;

    try {
      const response = await fetch('/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ productId, quantity })
      });

      const data = await response.json();

      if (data.success) {
        showToast(data.message);

        // Bump and update Cart Counter
        const cartBadge = document.querySelector('.cart-count-badge');
        if (cartBadge) {
          cartBadge.textContent = data.cart.totalQty;
          cartBadge.classList.add('bump');
          setTimeout(() => cartBadge.classList.remove('bump'), 300);
        }
      } else {
        showToast(data.message || 'Could not add to cart', 'error');
      }
    } catch (err) {
      showToast('Network error, please try again.', 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = originalText;
    }
  });
}

// 3. Wishlist Heart Toggle
function initWishlistToggle() {
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('.wishlist-toggle-btn');
    if (!btn) return;

    e.preventDefault();
    const productId = btn.dataset.productId;

    try {
      const response = await fetch(`/wishlist/toggle/${productId}`, {
        method: 'POST',
        headers: { 'Accept': 'application/json' }
      });

      if (response.status === 401) {
        window.location.href = '/auth/login?info=Please sign in to save items to wishlist';
        return;
      }

      const data = await response.json();
      if (data.success) {
        btn.classList.toggle('active', data.added);
        showToast(data.message);

        const wishlistBadge = document.querySelector('.wishlist-count-badge');
        if (wishlistBadge) {
          wishlistBadge.textContent = data.wishlistCount;
          wishlistBadge.classList.add('bump');
          setTimeout(() => wishlistBadge.classList.remove('bump'), 300);
        }
      }
    } catch (err) {
      console.error('Wishlist toggle error:', err);
    }
  });
}

// 4. Product Details Gallery Thumbnail Switcher
function initProductGallery() {
  const thumbs = document.querySelectorAll('.thumb-btn');
  const mainImage = document.getElementById('mainDetailImage');
  if (!thumbs.length || !mainImage) return;

  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      thumbs.forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
      const newSrc = thumb.dataset.fullSrc;
      if (newSrc) {
        mainImage.src = newSrc;
      }
    });
  });
}

// 5. Quantity Stepper (+ / -)
function initQuantityStepper() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.stepper-btn');
    if (!btn) return;

    const stepper = btn.closest('.quantity-stepper');
    if (!stepper) return;

    const input = stepper.querySelector('.stepper-input');
    if (!input) return;

    let val = parseInt(input.value) || 1;
    const max = parseInt(input.getAttribute('max')) || 99;

    if (btn.classList.contains('increment')) {
      if (val < max) val++;
    } else if (btn.classList.contains('decrement')) {
      if (val > 1) val--;
    }

    input.value = val;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
}

// 6. Auto-dismiss query alerts
function initAutoDismissAlerts() {
  const alerts = document.querySelectorAll('.alert');
  alerts.forEach(alert => {
    setTimeout(() => {
      alert.style.opacity = '0';
      alert.style.transform = 'translateY(-10px)';
      alert.style.transition = 'all 0.3s ease';
      setTimeout(() => alert.remove(), 300);
    }, 5000);
  });
}
