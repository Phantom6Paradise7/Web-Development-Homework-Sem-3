const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const Category = require('../models/Category');

// Admin Executive Dashboard
exports.getDashboard = async (req, res, next) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });

    // Aggregate total revenue
    const revenueData = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

    // Recent 5 orders
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Low stock warning (< 5 items)
    const lowStockProducts = await Product.find({ stock: { $lte: 5 } }).limit(5).lean();

    res.render('pages/admin/dashboard', {
      title: 'Admin Dashboard - Shopease',
      totalOrders,
      totalProducts,
      totalCustomers,
      totalRevenue: totalRevenue.toFixed(2),
      recentOrders,
      lowStockProducts
    });
  } catch (error) {
    next(error);
  }
};

// Admin Products List
exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 }).lean();
    res.render('pages/admin/products', {
      title: 'Manage Products - Shopease Admin',
      products
    });
  } catch (error) {
    next(error);
  }
};

// Render Create Product Form
exports.getCreateProduct = async (req, res, next) => {
  try {
    const categories = await Category.find().lean();
    res.render('pages/admin/product-form', {
      title: 'Add New Product - Shopease Admin',
      product: {},
      categories,
      isEdit: false
    });
  } catch (error) {
    next(error);
  }
};

// Handle Create Product POST
exports.postCreateProduct = async (req, res, next) => {
  try {
    const {
      name,
      brand,
      category,
      price,
      originalPrice,
      stock,
      description,
      thumbnail,
      images,
      badge,
      isFeatured,
      isTrending
    } = req.body;

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') + '-' + Math.floor(100 + Math.random() * 900);

    const imageArray = images
      ? images.split(',').map(s => s.trim()).filter(Boolean)
      : [thumbnail];

    const product = new Product({
      name,
      slug,
      brand,
      category,
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : parseFloat(price),
      stock: parseInt(stock),
      description,
      thumbnail: thumbnail || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
      images: imageArray.length > 0 ? imageArray : [thumbnail],
      badge: badge || '',
      isFeatured: !!isFeatured,
      isTrending: !!isTrending
    });

    await product.save();
    res.redirect('/admin/products?success=Product created successfully!');
  } catch (error) {
    next(error);
  }
};

// Render Edit Product Form
exports.getEditProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) {
      return res.redirect('/admin/products?error=Product not found');
    }

    const categories = await Category.find().lean();
    res.render('pages/admin/product-form', {
      title: `Edit ${product.name} - Shopease Admin`,
      product,
      categories,
      isEdit: true
    });
  } catch (error) {
    next(error);
  }
};

// Handle Edit Product POST
exports.postEditProduct = async (req, res, next) => {
  try {
    const {
      name,
      brand,
      category,
      price,
      originalPrice,
      stock,
      description,
      thumbnail,
      images,
      badge,
      isFeatured,
      isTrending
    } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.redirect('/admin/products?error=Product not found');
    }

    product.name = name;
    product.brand = brand;
    product.category = category;
    product.price = parseFloat(price);
    product.originalPrice = originalPrice ? parseFloat(originalPrice) : parseFloat(price);
    product.stock = parseInt(stock);
    product.description = description;
    product.thumbnail = thumbnail;
    if (images) {
      product.images = images.split(',').map(s => s.trim()).filter(Boolean);
    }
    product.badge = badge || '';
    product.isFeatured = !!isFeatured;
    product.isTrending = !!isTrending;

    await product.save();
    res.redirect('/admin/products?success=Product updated successfully!');
  } catch (error) {
    next(error);
  }
};

// Delete Product
exports.deleteProduct = async (req, res, next) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.redirect('/admin/products?success=Product deleted successfully');
  } catch (error) {
    next(error);
  }
};

// Admin Orders List
exports.getOrders = async (req, res, next) => {
  try {
    const statusFilter = req.query.status;
    let query = {};
    if (statusFilter && statusFilter !== 'all') {
      query.orderStatus = statusFilter;
    }

    const orders = await Order.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    res.render('pages/admin/orders', {
      title: 'Order Management - Shopease Admin',
      orders,
      activeStatus: statusFilter || 'all'
    });
  } catch (error) {
    next(error);
  }
};

// Update Order Status and append tracking event
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { orderStatus, trackingMessage, location } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.redirect('/admin/orders?error=Order not found');
    }

    order.orderStatus = orderStatus;

    if (orderStatus === 'delivered') {
      order.isDelivered = true;
      order.deliveredAt = new Date();
      order.paymentStatus = 'paid';
    }

    const message = trackingMessage || `Order status updated to ${orderStatus.toUpperCase()}`;
    order.trackingEvents.push({
      status: orderStatus,
      message,
      timestamp: new Date(),
      location: location || 'Logistics Hub'
    });

    await order.save();
    res.redirect(`/admin/orders?success=Order #${order.orderNumber} updated to ${orderStatus}`);
  } catch (error) {
    next(error);
  }
};
