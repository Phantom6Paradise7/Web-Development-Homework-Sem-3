// Middleware to protect routes for authenticated users
const ensureAuth = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  req.session.returnTo = req.originalUrl;
  return res.redirect('/auth/login?error=Please log in to continue');
};

// Middleware to prevent authenticated users from visiting login/register
const ensureGuest = (req, res, next) => {
  if (req.session && req.session.user) {
    return res.redirect('/');
  }
  return next();
};

// Middleware to protect admin routes
const ensureAdmin = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  return res.status(403).render('pages/403', {
    title: 'Access Denied',
    message: 'You need administrator privileges to access this page.'
  });
};

// Middleware to protect supplier routes (accessible by suppliers and admins)
const ensureSupplier = (req, res, next) => {
  if (req.session && req.session.user && (req.session.user.role === 'supplier' || req.session.user.role === 'admin')) {
    return next();
  }
  return res.status(403).render('pages/403', {
    title: 'Access Denied',
    message: 'You need an authorized Supplier or Admin account to access this portal.'
  });
};

// Middleware to protect delivery rider routes (accessible by riders and admins)
const ensureRider = (req, res, next) => {
  if (req.session && req.session.user && (req.session.user.role === 'rider' || req.session.user.role === 'admin')) {
    return next();
  }
  return res.status(403).render('pages/403', {
    title: 'Access Denied',
    message: 'You need an authorized Delivery Rider or Admin account to access this fleet portal.'
  });
};

module.exports = {
  ensureAuth,
  ensureGuest,
  ensureAdmin,
  ensureSupplier,
  ensureRider
};
