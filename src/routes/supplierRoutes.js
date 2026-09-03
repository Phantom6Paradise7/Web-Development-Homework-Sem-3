const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const { ensureSupplier } = require('../middleware/auth');

// Protect all supplier routes
router.use('/supplier', ensureSupplier);

// Supplier Dashboard
router.get('/supplier', supplierController.getDashboard);

// Supplier Product & Inventory Management
router.get('/supplier/products', supplierController.getProducts);
router.get('/supplier/products/new', supplierController.getCreateProduct);
router.post('/supplier/products/new', supplierController.postCreateProduct);
router.get('/supplier/products/:id/edit', supplierController.getEditProduct);
router.post('/supplier/products/:id/edit', supplierController.postEditProduct);

// Quick Stock Adjustment (+/- or set)
router.post('/supplier/products/:id/stock', supplierController.adjustStock);

// Supplier Orders & Fulfillment
router.get('/supplier/orders', supplierController.getOrders);

module.exports = router;
