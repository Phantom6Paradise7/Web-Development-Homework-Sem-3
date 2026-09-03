const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

router.get('/cart', cartController.getCart);
router.post('/cart/add', cartController.addToCart);
router.post('/cart/update', cartController.updateQuantity);
router.post('/cart/remove/:productId', cartController.removeFromCart);
router.get('/cart/remove/:productId', cartController.removeFromCart); // convenient link fallback
router.post('/cart/clear', cartController.clearCart);
router.post('/cart/coupon', cartController.applyCoupon);
router.post('/cart/coupon/remove', cartController.removeCoupon);

module.exports = router;
