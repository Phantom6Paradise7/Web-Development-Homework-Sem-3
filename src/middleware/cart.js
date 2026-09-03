const Category = require('../models/Category');
const User = require('../models/User');

const initCartAndLocals = async (req, res, next) => {
  // Initialize session cart if not present
  if (!req.session.cart) {
    req.session.cart = {
      items: [],
      totalQty: 0,
      subtotal: 0,
      discount: 0,
      shipping: 0,
      total: 0,
      coupon: null
    };
  }

  // Calculate cart totals
  const cart = req.session.cart;
  let totalQty = 0;
  let subtotal = 0;

  cart.items.forEach(item => {
    totalQty += item.quantity;
    subtotal += item.price * item.quantity;
  });

  cart.totalQty = totalQty;
  cart.subtotal = parseFloat(subtotal.toFixed(2));

  // Calculate discount if coupon applied
  let discount = 0;
  if (cart.coupon && cart.coupon.code) {
    if (cart.coupon.type === 'percentage') {
      discount = (subtotal * cart.coupon.value) / 100;
    } else if (cart.coupon.type === 'fixed') {
      discount = cart.coupon.value;
    }
  }
  cart.discount = parseFloat(Math.min(discount, subtotal).toFixed(2));

  // Free shipping over $50, else $9.99
  const shipping = (cart.subtotal > 50 || cart.subtotal === 0) ? 0 : 9.99;
  cart.shipping = parseFloat(shipping.toFixed(2));

  // Final total (subtotal - discount + shipping)
  cart.total = parseFloat(Math.max(0, cart.subtotal - cart.discount + cart.shipping).toFixed(2));

  // Expose global locals for all EJS views
  res.locals.cart = cart;
  res.locals.currentUser = req.session.user || null;
  res.locals.currentPath = req.path;
  res.locals.query = req.query;

  // Flash messages / query alerts
  res.locals.successMsg = req.query.success || null;
  res.locals.errorMsg = req.query.error || null;
  res.locals.infoMsg = req.query.info || null;

  // Fetch wishlist count if logged in
  if (req.session.user) {
    try {
      const user = await User.findById(req.session.user._id).select('wishlist');
      res.locals.wishlistCount = user ? user.wishlist.length : 0;
    } catch (err) {
      res.locals.wishlistCount = 0;
    }
  } else {
    res.locals.wishlistCount = 0;
  }

  // Expose available categories for navbar dropdown
  try {
    const categories = await Category.find().sort({ name: 1 }).lean();
    res.locals.navCategories = categories;
  } catch (err) {
    res.locals.navCategories = [];
  }

  next();
};

module.exports = initCartAndLocals;
