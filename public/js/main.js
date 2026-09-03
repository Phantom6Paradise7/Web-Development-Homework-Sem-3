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
  initQuickViewModal();
  initStockAdjusters();
  initFlashCountdown();
  initRecentlyViewed();
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
    // Look for nearby or modal stepper input
    const modalWrap = btn.closest('.quick-view-dialog-content');
    const stepper = modalWrap 
      ? modalWrap.querySelector('.stepper-input') 
      : document.querySelector('.stepper-input');
    const quantity = stepper ? parseInt(stepper.value) || 1 : 1;

    const originalHtml = btn.innerHTML;
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
      btn.innerHTML = originalHtml;
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
  document.addEventListener('click', (e) => {
    const thumb = e.target.closest('.thumb-btn');
    if (!thumb) return;

    const gallery = thumb.closest('.gallery-container') || thumb.closest('.quick-view-gallery');
    if (!gallery) return;

    const mainImage = gallery.querySelector('.main-image-frame img');
    if (!mainImage) return;

    const allThumbs = gallery.querySelectorAll('.thumb-btn');
    allThumbs.forEach(t => t.classList.remove('active'));
    thumb.classList.add('active');

    const newSrc = thumb.dataset.fullSrc;
    if (newSrc) {
      mainImage.src = newSrc;
    }
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

// 7. Interactive Product Quick View Modal
function initQuickViewModal() {
  const modal = document.getElementById('quickViewModal');
  const modalBody = document.getElementById('quickViewModalBody');
  const closeBtn = document.getElementById('closeQuickViewBtn');
  if (!modal || !modalBody) return;

  if (closeBtn) {
    closeBtn.addEventListener('click', () => modal.close());
  }

  modal.addEventListener('click', (e) => {
    const rect = modal.getBoundingClientRect();
    const isInDialog = (
      rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
      rect.left <= e.clientX && e.clientX <= rect.left + rect.width
    );
    if (!isInDialog) {
      modal.close();
    }
  });

  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('.quick-view-btn');
    if (!btn) return;

    e.preventDefault();
    const productId = btn.dataset.productId;
    if (!productId) return;

    modalBody.innerHTML = `
      <div style="padding: 3rem; text-align: center;">
        <div style="font-size: 2rem; margin-bottom: 0.5rem;" class="animate-spin">⏳</div>
        <p style="color: var(--text-muted); font-size: 0.9rem;">Loading product details...</p>
      </div>
    `;
    modal.showModal();

    try {
      const res = await fetch(`/api/products/${productId}/quickview`);
      const data = await res.json();

      if (data.success && data.product) {
        const p = data.product;
        const images = p.images && p.images.length > 0 ? p.images : [p.thumbnail];

        modalBody.innerHTML = `
          <div class="quick-view-grid">
            <!-- Gallery -->
            <div class="quick-view-gallery">
              <div class="main-image-frame" style="height: 320px; border-radius: var(--radius-md); overflow: hidden; background: #f8fafc; margin-bottom: 0.75rem;">
                <img src="${images[0]}" alt="${p.name}" style="width: 100%; height: 100%; object-fit: cover;">
              </div>
              ${images.length > 1 ? `
                <div class="thumbnails-row" style="display: flex; gap: 0.5rem; overflow-x: auto;">
                  ${images.map((img, idx) => `
                    <button type="button" class="thumb-btn ${idx === 0 ? 'active' : ''}" data-full-src="${img}" style="width: 50px; height: 50px; flex-shrink: 0; padding: 0; border: 2px solid ${idx === 0 ? 'var(--primary)' : 'var(--border-subtle)'}; border-radius: var(--radius-sm); overflow: hidden; cursor: pointer;">
                      <img src="${img}" alt="Preview ${idx + 1}" style="width: 100%; height: 100%; object-fit: cover;">
                    </button>
                  `).join('')}
                </div>
              ` : ''}
            </div>

            <!-- Info & Actions -->
            <div class="quick-view-info">
              <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--primary); font-weight: 700; margin-bottom: 0.25rem;">
                ${p.brand} • ${p.category}
              </div>
              <h2 style="font-size: 1.4rem; font-weight: 800; line-height: 1.3; margin-bottom: 0.5rem; color: var(--text-primary);">
                ${p.name}
              </h2>

              <div style="font-size: 0.8rem; color: #0891b2; font-weight: 600; margin-bottom: 0.75rem;">
                🏭 Sold by: ${p.supplierName}
              </div>

              <!-- Rating & Stock Level -->
              <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap;">
                <div style="color: #f59e0b; font-size: 0.9rem; font-weight: 700;">
                  ★ ${p.ratings ? p.ratings.toFixed(1) : '5.0'} (${p.numReviews || 0})
                </div>
                <div>
                  ${p.stock > 10 
                    ? `<span style="background: #dcfce7; color: #15803d; font-size: 0.75rem; font-weight: 700; padding: 0.2rem 0.5rem; border-radius: var(--radius-sm);">✓ ${p.stock} in stock</span>`
                    : (p.stock > 0 
                      ? `<span style="background: #ffedd5; color: #c2410c; font-size: 0.75rem; font-weight: 700; padding: 0.2rem 0.5rem; border-radius: var(--radius-sm);">⚠️ Only ${p.stock} left</span>`
                      : `<span style="background: #fee2e2; color: #b91c1c; font-size: 0.75rem; font-weight: 700; padding: 0.2rem 0.5rem; border-radius: var(--radius-sm);">✕ Sold Out</span>`
                    )
                  }
                </div>
              </div>

              <!-- Pricing -->
              <div style="display: flex; align-items: baseline; gap: 0.75rem; margin-bottom: 1rem;">
                <span style="font-size: 1.6rem; font-weight: 800; color: var(--text-primary);">$${p.price.toFixed(2)}</span>
                ${p.originalPrice && p.originalPrice > p.price ? `
                  <span style="font-size: 0.95rem; text-decoration: line-through; color: var(--text-muted);">$${p.originalPrice.toFixed(2)}</span>
                  <span style="background: #fee2e2; color: #dc2626; font-size: 0.75rem; font-weight: 700; padding: 0.15rem 0.45rem; border-radius: var(--radius-sm);">${p.discountPercent}% OFF</span>
                ` : ''}
              </div>

              <p style="font-size: 0.875rem; color: var(--text-secondary); line-height: 1.6; margin-bottom: 1.25rem;">
                ${p.description.length > 180 ? p.description.substring(0, 180) + '...' : p.description}
              </p>

              <!-- Highlights -->
              ${p.features && p.features.length > 0 ? `
                <ul style="list-style: none; padding: 0; margin-bottom: 1.5rem; font-size: 0.8rem; color: var(--text-secondary); display: flex; flex-direction: column; gap: 0.35rem;">
                  ${p.features.slice(0, 3).map(f => `
                    <li style="display: flex; align-items: center; gap: 0.4rem;">
                      <span style="color: #10b981; font-weight: bold;">✓</span> ${f}
                    </li>
                  `).join('')}
                </ul>
              ` : ''}

              <!-- Stepper & Add to Cart -->
              ${p.stock > 0 ? `
                <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.25rem;">
                  <div class="quantity-stepper" style="display: inline-flex; border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); overflow: hidden;">
                    <button type="button" class="stepper-btn decrement" style="width: 34px; height: 38px; background: var(--bg-muted); border: none; font-size: 1.1rem; cursor: pointer;">-</button>
                    <input type="number" class="stepper-input" value="1" min="1" max="${p.stock}" readonly style="width: 44px; height: 38px; text-align: center; border: none; font-weight: 600;">
                    <button type="button" class="stepper-btn increment" style="width: 34px; height: 38px; background: var(--bg-muted); border: none; font-size: 1.1rem; cursor: pointer;">+</button>
                  </div>
                  <button type="button" class="btn btn-primary ajax-add-cart-btn" data-product-id="${p._id}" style="flex: 1; height: 40px;">
                    Add to Cart
                  </button>
                </div>
              ` : `
                <button class="btn btn-outline btn-block" disabled style="opacity: 0.6; cursor: not-allowed; margin-bottom: 1rem;">
                  Sold Out
                </button>
              `}

              <a href="/product/${p.slug}" style="font-size: 0.85rem; font-weight: 700; color: var(--primary); display: inline-block;">
                View Full Specifications & Verified Reviews &rarr;
              </a>
            </div>
          </div>
        `;
      } else {
        modalBody.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--danger);">Failed to load product details.</div>';
      }
    } catch (err) {
      modalBody.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--danger);">Network error. Please try again.</div>';
    }
  });
}

// 8. 1-Click Stock Add / Remove Live Adjuster
function initStockAdjusters() {
  document.addEventListener('click', async (e) => {
    const adjustBtn = e.target.closest('.btn-stock-adjust') || e.target.closest('.btn-stock-set');
    if (!adjustBtn) return;

    e.preventDefault();
    const widget = adjustBtn.closest('.stock-action-widget');
    if (!widget) return;

    const endpoint = widget.dataset.endpoint;
    const productId = widget.dataset.productId;
    const action = adjustBtn.dataset.action; // 'add', 'remove', 'set'
    const amount = adjustBtn.dataset.amount ? parseInt(adjustBtn.dataset.amount) : null;
    
    let stockVal = null;
    if (action === 'set') {
      const input = widget.querySelector('.stock-direct-input');
      if (input) {
        stockVal = parseInt(input.value) || 0;
      }
    }

    // Visual feedback on button
    adjustBtn.style.transform = 'scale(0.92)';
    setTimeout(() => adjustBtn.style.transform = '', 150);

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ action, amount, stock: stockVal })
      });

      const data = await res.json();

      if (data.success) {
        showToast(data.message, 'success');

        // Update the direct number input in the widget
        const directInput = widget.querySelector('.stock-direct-input');
        if (directInput) {
          directInput.value = data.newStock;
        }

        // Update the stock badge pill on the table / page
        const badgeWrap = document.getElementById(`stock-badge-${productId}`);
        if (badgeWrap) {
          if (data.newStock > 10) {
            badgeWrap.innerHTML = `
              <span class="stock-badge in-stock">
                ✓ <span class="stock-num">${data.newStock}</span> in stock
              </span>
            `;
          } else if (data.newStock > 0) {
            badgeWrap.innerHTML = `
              <span class="stock-badge low-stock">
                ⚠️ Only <span class="stock-num">${data.newStock}</span> left
              </span>
            `;
          } else {
            badgeWrap.innerHTML = `
              <span class="stock-badge out-stock">
                ✕ Sold Out (0)
              </span>
            `;
          }
        }

        // Update liveStockDisplay on product detail page if open
        const liveStock = document.getElementById('liveStockDisplay');
        if (liveStock) {
          liveStock.textContent = data.newStock;
        }
      } else {
        showToast(data.message || 'Stock adjustment failed', 'error');
      }
    } catch (err) {
      showToast('Error updating stock inventory.', 'error');
    }
  });
}

// 9. Real-time Flash Deal Countdown Timer (Hours, Minutes, Seconds)
function initFlashCountdown() {
  const countdownEl = document.getElementById('flashCountdown');
  if (!countdownEl) return;

  const hoursEl = document.getElementById('countHours');
  const minutesEl = document.getElementById('countMinutes');
  const secondsEl = document.getElementById('countSeconds');
  if (!hoursEl || !minutesEl || !secondsEl) return;

  // Set deal duration: 8 hours from first load or persist in session
  let targetTime = sessionStorage.getItem('shopease_flash_target');
  if (!targetTime) {
    targetTime = Date.now() + 8 * 60 * 60 * 1000 + 48 * 60 * 1000 + 35 * 1000;
    sessionStorage.setItem('shopease_flash_target', targetTime);
  } else {
    targetTime = parseInt(targetTime);
  }

  function updateTimer() {
    const diff = targetTime - Date.now();
    if (diff <= 0) {
      hoursEl.textContent = '00';
      minutesEl.textContent = '00';
      secondsEl.textContent = '00';
      return;
    }

    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);

    hoursEl.textContent = String(h).padStart(2, '0');
    minutesEl.textContent = String(m).padStart(2, '0');
    secondsEl.textContent = String(s).padStart(2, '0');
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

// 10. Recently Viewed Products via LocalStorage
function initRecentlyViewed() {
  const detailTitle = document.querySelector('.detail-title');
  if (detailTitle) {
    // We are on a product page, store this product
    const pathParts = window.location.pathname.split('/');
    const slug = pathParts[pathParts.length - 1];
    const priceEl = document.querySelector('.detail-current-price');
    const imgEl = document.getElementById('mainDetailImage');
    const brandEl = document.querySelector('.detail-brand-badge');

    if (slug && priceEl && imgEl) {
      const item = {
        slug,
        name: detailTitle.textContent.trim(),
        price: priceEl.textContent.trim(),
        thumbnail: imgEl.src,
        brand: brandEl ? brandEl.textContent.trim() : ''
      };

      try {
        let recents = JSON.parse(localStorage.getItem('shopease_recents') || '[]');
        recents = recents.filter(r => r.slug !== slug);
        recents.unshift(item);
        if (recents.length > 6) recents.pop();
        localStorage.setItem('shopease_recents', JSON.stringify(recents));
      } catch (e) {
        console.warn('LocalStorage error for recently viewed:', e);
      }
    }
  }

  // Render on Home page if section exists
  const recentsSection = document.getElementById('recentlyViewedSection');
  const recentsGrid = document.getElementById('recentlyViewedGrid');
  if (recentsSection && recentsGrid) {
    try {
      const recents = JSON.parse(localStorage.getItem('shopease_recents') || '[]');
      if (recents.length > 0) {
        recentsGrid.innerHTML = recents.map(r => `
          <div class="product-card">
            <div class="product-thumb-wrap">
              <a href="/product/${r.slug}">
                <img src="${r.thumbnail}" alt="${r.name}" loading="lazy">
              </a>
            </div>
            <div class="product-card-body">
              <div class="product-meta">
                <span>${r.brand || 'Shopease'}</span>
              </div>
              <a href="/product/${r.slug}">
                <h3 class="product-title" title="${r.name}">${r.name}</h3>
              </a>
              <div class="product-pricing">
                <div class="current-price">${r.price}</div>
              </div>
              <a href="/product/${r.slug}" class="btn btn-outline btn-sm btn-block" style="margin-top: 0.5rem;">
                View Product
              </a>
            </div>
          </div>
        `).join('');
        recentsSection.style.display = 'block';
      }
    } catch (e) {
      console.warn('Error reading recently viewed:', e);
    }
  }
}
