const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { ensureAuth } = require('../middleware/auth');

router.get('/checkout', ensureAuth, orderController.getCheckout);
router.post('/checkout', ensureAuth, orderController.placeOrder);
router.get('/order-success/:id', ensureAuth, orderController.getOrderSuccess);
router.get('/orders', ensureAuth, orderController.getMyOrders);
router.get('/orders/:id', ensureAuth, orderController.getOrderById);
router.post('/orders/:id/cancel', ensureAuth, orderController.cancelOrder);

module.exports = router;
