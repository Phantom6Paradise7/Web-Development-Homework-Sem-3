const express = require('express');
const router = express.Router();
const riderController = require('../controllers/riderController');
const { ensureRider } = require('../middleware/auth');

// Scope all rider routes with ensureRider guard
router.use('/rider', ensureRider);

router.get('/rider', (req, res) => res.redirect('/rider/dashboard'));
router.get('/rider/dashboard', riderController.getRiderDashboard);
router.get('/rider/orders', riderController.getRiderOrders);
router.post('/rider/orders/:id/status', riderController.updateOrderStatus);
router.post('/rider/orders/:id/cancel', riderController.cancelDelivery);

module.exports = router;
