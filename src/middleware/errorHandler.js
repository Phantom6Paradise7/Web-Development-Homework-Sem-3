const notFound = (req, res, next) => {
  res.status(404).render('pages/404', {
    title: '404 - Page Not Found',
    path: req.originalUrl
  });
};

const errorHandler = (err, req, res, next) => {
  console.error('[Error Stack]', err);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).render('pages/500', {
    title: '500 - Server Error',
    error: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred.' : err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

module.exports = {
  notFound,
  errorHandler
};
