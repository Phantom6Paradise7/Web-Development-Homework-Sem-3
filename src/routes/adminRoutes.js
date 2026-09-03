const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { ensureAdmin } = require('../middleware/auth');

// Protect all admin routes with ensureAdmin
router.use('/admin', ensureAdmin);

router.get('/admin', adminController.getDashboard);
router.get('/admin/products', adminController.getProducts);
router.get('/admin/products/new', adminController.getCreateProduct);
router.post('/admin/products/new', adminController.postCreateProduct);
router.get('/admin/products/:id/edit', adminController.getEditProduct);
router.post('/admin/products/:id/edit', adminController.postEditProduct);
router.post('/admin/products/:id/delete', adminController.deleteProduct);
router.post('/admin/products/:id/stock', adminController.adjustStock);

// Category Studio
router.get('/admin/categories', adminController.getCategories);
router.post('/admin/categories/new', adminController.postCreateCategory);
router.post('/admin/categories/:id/edit', adminController.postEditCategory);
router.post('/admin/categories/:id/delete', adminController.deleteCategory);

// Orders & Suppliers
router.get('/admin/orders', adminController.getOrders);
router.post('/admin/orders/:id/status', adminController.updateOrderStatus);
router.get('/admin/suppliers', adminController.getSuppliers);

module.exports = router;
