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

module.exports = {
  ensureAuth,
  ensureGuest,
  ensureAdmin
};
