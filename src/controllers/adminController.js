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
    const totalSuppliers = await User.countDocuments({ role: 'supplier' });

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
      totalSuppliers,
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

// Quick Stock Adjuster for Admin (AJAX or Form POST)
// Allows stock add (+1, +5, +10), stock remove (-1, -5, -10), or set exact stock
exports.adjustStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, amount, stock } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      return res.redirect('/admin/products?error=Product not found');
    }

    const step = parseInt(amount) || 1;
    let oldStock = product.stock;

    if (action === 'add' || action === 'increment') {
      product.stock += step;
    } else if (action === 'remove' || action === 'decrement') {
      product.stock = Math.max(0, product.stock - step);
    } else if (action === 'set' || stock !== undefined) {
      product.stock = Math.max(0, parseInt(stock) || 0);
    }

    await product.save();

    const change = product.stock - oldStock;
    const message = change >= 0
      ? `Added ${change} units to "${product.name}". Current stock: ${product.stock}`
      : `Removed ${Math.abs(change)} units from "${product.name}". Current stock: ${product.stock}`;

    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return res.json({
        success: true,
        productId: product._id,
        newStock: product.stock,
        oldStock,
        change,
        message
      });
    }

    res.redirect(`/admin/products?success=${encodeURIComponent(message)}`);
  } catch (error) {
    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return res.status(500).json({ success: false, message: error.message });
    }
    next(error);
  }
};

// Admin Category Studio: List all categories with product counts
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 }).lean();

    // Attach item counts dynamically
    const categoriesWithCounts = await Promise.all(
      categories.map(async cat => {
        const count = await Product.countDocuments({
          category: { $regex: new RegExp(`^${cat.name}$`, 'i') }
        });
        return {
          ...cat,
          productCount: count
        };
      })
    );

    res.render('pages/admin/categories', {
      title: 'Category Studio - Shopease Admin',
      categories: categoriesWithCounts
    });
  } catch (error) {
    next(error);
  }
};

// Handle Create Category POST
exports.postCreateCategory = async (req, res, next) => {
  try {
    const { name, description, icon, image, bannerImage } = req.body;

    if (!name || !name.trim()) {
      return res.redirect('/admin/categories?error=Category name is required');
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const existing = await Category.findOne({ slug });
    if (existing) {
      return res.redirect('/admin/categories?error=Category with this name or slug already exists');
    }

    const category = new Category({
      name: name.trim(),
      slug,
      description: description || '',
      icon: icon || 'tag',
      image: image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
      bannerImage: bannerImage || image || '',
      isFeatured: true
    });

    await category.save();
    res.redirect('/admin/categories?success=Category created successfully!');
  } catch (error) {
    next(error);
  }
};

// Handle Edit Category POST
exports.postEditCategory = async (req, res, next) => {
  try {
    const { name, description, icon, image, bannerImage } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.redirect('/admin/categories?error=Category not found');
    }

    const oldName = category.name;
    category.name = name.trim();
    category.slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    category.description = description || '';
    category.icon = icon || category.icon;
    category.image = image || category.image;
    category.bannerImage = bannerImage || category.bannerImage;

    await category.save();

    // If name changed, update products using this category
    if (oldName !== category.name) {
      await Product.updateMany({ category: oldName }, { category: category.name });
    }

    res.redirect('/admin/categories?success=Category updated successfully!');
  } catch (error) {
    next(error);
  }
};

// Delete Category
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.redirect('/admin/categories?error=Category not found');
    }

    await Category.findByIdAndDelete(req.params.id);
    res.redirect(`/admin/categories?success=Category "${category.name}" removed`);
  } catch (error) {
    next(error);
  }
};

// Admin Suppliers Directory
exports.getSuppliers = async (req, res, next) => {
  try {
    const suppliers = await User.find({ role: 'supplier' }).sort({ createdAt: -1 }).lean();

    const suppliersWithData = await Promise.all(
      suppliers.map(async s => {
        const productsCount = await Product.countDocuments({ supplier: s._id });
        const products = await Product.find({ supplier: s._id }).select('stock price').lean();
        const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);
        return {
          ...s,
          productsCount,
          totalStock
        };
      })
    );

    res.render('pages/admin/suppliers', {
      title: 'Supplier & Partner Network - Shopease Admin',
      suppliers: suppliersWithData
    });
  } catch (error) {
    next(error);
  }
};
