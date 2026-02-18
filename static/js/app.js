// ============================================================
// MADAM CHOICE FOOTWEAR — app.js
// ============================================================

// ─────────────────────────────────────────
// 🛒 CART FUNCTIONS
// ─────────────────────────────────────────

/**
 * Add a product to the cart (call this from your product pages)
 * Usage: addToCart('Red Heels', 850)
 */
function addToCart(name, price) {
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');

  const existing = cart.find(i => i.name === name);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ name, price: parseFloat(price), quantity: 1 });
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  showToast(`✅ "${name}" added to cart!`);
  updateCartBadge();
}

/**
 * Get total number of items in cart (for nav badge)
 */
function getCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  return cart.reduce((sum, i) => sum + i.quantity, 0);
}

/**
 * Update cart item count badge in navbar (if element exists)
 * Add id="cartBadge" to your navbar cart icon to use this
 */
function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  if (!badge) return;
  const count = getCartCount();
  badge.innerText = count;
  badge.style.display = count > 0 ? 'inline-block' : 'none';
}

// ─────────────────────────────────────────
// 💳 PAYMENT — redirect to /pay
// ─────────────────────────────────────────

/**
 * Go to payment page.
 * Cart items are already in localStorage — pay.html reads them directly.
 * No prompts, no hardcoded data.
 */
function startPayment() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');

  if (cart.length === 0) {
    showToast('Your cart is empty! Add items first.', 'error');
    return;
  }

  window.location.href = '/pay';
}

// ─────────────────────────────────────────
// ⭐ REVIEWS
// ─────────────────────────────────────────

/**
 * Submit a new review
 */
async function submitReviewForm(e) {
  e.preventDefault();

  const name     = document.getElementById('reviewName')?.value?.trim();
  const text     = document.getElementById('reviewText')?.value?.trim();
  const ratingEl = document.querySelector('input[name="rating"]:checked');
  const rating   = ratingEl ? Number(ratingEl.value) : 0;

  if (!name || !text || !rating) {
    showToast('Please fill in all review fields.', 'error');
    return;
  }

  try {
    const res = await fetch('/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      // ✅ FIXED: Your backend uses Form(...) not JSON
      body: new URLSearchParams({ name, rating, text })
    });

    if (res.ok) {
      showToast('✅ Review submitted! Thank you.');
      e.target.reset();
      loadReviews();
    } else {
      showToast('Could not submit review. Try again.', 'error');
    }
  } catch (err) {
    console.error('Review submit error:', err);
    showToast('Something went wrong. Try again.', 'error');
  }
}

/**
 * Load and display reviews
 */
async function loadReviews() {
  const container = document.getElementById('reviews');
  if (!container) return;

  try {
    const res  = await fetch('/reviews');
    const list = await res.json();

    if (list.length === 0) {
      container.innerHTML = '<p class="text-muted text-center">No reviews yet. Be the first!</p>';
      return;
    }

    container.innerHTML = list.map(r => `
      <div class="card mb-2 p-3 shadow-sm">
        <div class="d-flex justify-content-between align-items-center mb-1">
          <strong>${escapeHtml(r.name)}</strong>
          <span style="color:#f59e0b; font-size:1.1rem;">
            ${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}
          </span>
        </div>
        <p class="mb-0 text-muted" style="font-size:0.95rem;">${escapeHtml(r.text)}</p>
      </div>
    `).join('');
  } catch (err) {
    console.error('Load reviews error:', err);
    container.innerHTML = '<p class="text-danger">Could not load reviews.</p>';
  }
}

// ─────────────────────────────────────────
// 🍞 TOAST NOTIFICATION
// Replaces all alert() and prompt() calls
// ─────────────────────────────────────────

function showToast(message, type = 'success') {
  // Remove existing toast if any
  const existing = document.getElementById('globalToast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'globalToast';
  toast.innerText = message;

  Object.assign(toast.style, {
    position:     'fixed',
    bottom:       '28px',
    left:         '50%',
    transform:    'translateX(-50%) translateY(80px)',
    background:   type === 'error' ? '#e53935' : '#1a237e',
    color:        'white',
    padding:      '14px 28px',
    borderRadius: '50px',
    fontSize:     '0.95rem',
    fontWeight:   '600',
    zIndex:       '99999',
    boxShadow:    '0 5px 20px rgba(0,0,0,0.25)',
    transition:   'transform 0.35s ease',
    whiteSpace:   'nowrap',
  });

  document.body.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });
  });

  // Auto-dismiss after 3s
  setTimeout(() => {
    toast.style.transform = 'translateX(-50%) translateY(80px)';
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

// ─────────────────────────────────────────
// 🔒 SECURITY HELPER
// Prevents XSS when rendering user content
// ─────────────────────────────────────────

function escapeHtml(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

// ─────────────────────────────────────────
// 🚀 INIT — runs on every page
// ─────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  loadReviews();

  // Wire up review form if it exists on this page
  const reviewForm = document.getElementById('reviewForm');
  if (reviewForm) {
    reviewForm.addEventListener('submit', submitReviewForm);
  }
});