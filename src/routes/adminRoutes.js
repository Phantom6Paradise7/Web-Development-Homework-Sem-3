const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { ensureAdmin } = require('../middleware/auth');

// Protect all admin routes with ensureAdmin
router.use(ensureAdmin);

router.get('/admin', adminController.getDashboard);
router.get('/admin/products', adminController.getProducts);
router.get('/admin/products/new', adminController.getCreateProduct);
router.post('/admin/products/new', adminController.postCreateProduct);
router.get('/admin/products/:id/edit', adminController.getEditProduct);
router.post('/admin/products/:id/edit', adminController.postEditProduct);
router.post('/admin/products/:id/delete', adminController.deleteProduct);

router.get('/admin/orders', adminController.getOrders);
router.post('/admin/orders/:id/status', adminController.updateOrderStatus);

module.exports = router;
