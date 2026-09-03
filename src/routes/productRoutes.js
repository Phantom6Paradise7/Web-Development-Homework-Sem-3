const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { ensureAuth } = require('../middleware/auth');

router.get('/', productController.getHome);
router.get('/shop', productController.getShop);
router.get('/product/:slug', productController.getProductBySlug);
router.post('/product/:id/reviews', ensureAuth, productController.addReview);
router.get('/api/search', productController.apiLiveSearch);

module.exports = router;
