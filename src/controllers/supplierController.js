const Product = require('../models/Product');
const Order = require('../models/Order');
const Category = require('../models/Category');

// Supplier Executive Dashboard
exports.getDashboard = async (req, res, next) => {
  try {
    const supplierId = req.session.user._id;
    const query = req.session.user.role === 'admin' ? {} : { supplier: supplierId };

    const products = await Product.find(query).lean();
    const totalProducts = products.length;
    const inStockCount = products.filter(p => p.stock > 0).length;
    const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= 5);
    const outOfStockCount = products.filter(p => p.stock === 0).length;
    const totalStockUnits = products.reduce((acc, p) => acc + (p.stock || 0), 0);
    const totalInventoryValue = products.reduce((acc, p) => acc + ((p.stock || 0) * p.price), 0);

    // Find orders that contain this supplier's products
    const productIds = products.map(p => p._id);
    const recentOrders = await Order.find({
      'orderItems.product': { $in: productIds }
    })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    res.render('pages/supplier/dashboard', {
      title: 'Supplier Portal Dashboard - Shopease',
      totalProducts,
      inStockCount,
      outOfStockCount,
      lowStockProducts,
      totalStockUnits,
      totalInventoryValue: totalInventoryValue.toFixed(2),
      recentOrders,
      supplierName: req.session.user.supplierInfo?.companyName || req.session.user.name
    });
  } catch (error) {
    next(error);
  }
};

// Supplier Products & Inventory List
exports.getProducts = async (req, res, next) => {
  try {
    const supplierId = req.session.user._id;
    const query = req.session.user.role === 'admin' ? {} : { supplier: supplierId };

    const products = await Product.find(query).sort({ createdAt: -1 }).lean();
    const categories = await Category.find().lean();

    res.render('pages/supplier/products', {
      title: 'Stock & Inventory Management - Supplier Portal',
      products,
      categories,
      supplierName: req.session.user.supplierInfo?.companyName || req.session.user.name
    });
  } catch (error) {
    next(error);
  }
};

// Render Create Product Form for Supplier
exports.getCreateProduct = async (req, res, next) => {
  try {
    const categories = await Category.find().lean();
    res.render('pages/supplier/product-form', {
      title: 'Add New Catalog Item - Supplier Portal',
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
      features
    } = req.body;

    const supplierId = req.session.user._id;
    const supplierName = req.session.user.supplierInfo?.companyName || req.session.user.name;

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') + '-' + Math.floor(100 + Math.random() * 900);

    const imageArray = images
      ? images.split(',').map(s => s.trim()).filter(Boolean)
      : [thumbnail];

    const featureArray = features
      ? (Array.isArray(features) ? features : features.split('\n').map(f => f.trim()).filter(Boolean))
      : [];

    const product = new Product({
      name,
      slug,
      brand: brand || supplierName,
      category,
      supplier: supplierId,
      supplierName,
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : parseFloat(price),
      stock: parseInt(stock) || 0,
      description,
      thumbnail: thumbnail || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
      images: imageArray.length > 0 ? imageArray : [thumbnail],
      features: featureArray,
      badge: badge || '',
      isFeatured: false,
      isTrending: false
    });

    await product.save();
    res.redirect('/supplier/products?success=Product successfully listed in inventory!');
  } catch (error) {
    next(error);
  }
};

// Render Edit Product Form for Supplier
exports.getEditProduct = async (req, res, next) => {
  try {
    const query = req.session.user.role === 'admin'
      ? { _id: req.params.id }
      : { _id: req.params.id, supplier: req.session.user._id };

    const product = await Product.findOne(query).lean();
    if (!product) {
      return res.redirect('/supplier/products?error=Product not found or access denied');
    }

    const categories = await Category.find().lean();
    res.render('pages/supplier/product-form', {
      title: `Edit ${product.name} - Supplier Portal`,
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
    const query = req.session.user.role === 'admin'
      ? { _id: req.params.id }
      : { _id: req.params.id, supplier: req.session.user._id };

    const product = await Product.findOne(query);
    if (!product) {
      return res.redirect('/supplier/products?error=Product not found or access denied');
    }

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
      features
    } = req.body;

    product.name = name;
    product.brand = brand || product.brand;
    product.category = category;
    product.price = parseFloat(price);
    product.originalPrice = originalPrice ? parseFloat(originalPrice) : parseFloat(price);
    product.stock = Math.max(0, parseInt(stock) || 0);
    product.description = description;
    product.thumbnail = thumbnail;
    if (images) {
      product.images = images.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (features) {
      product.features = Array.isArray(features) ? features : features.split('\n').map(f => f.trim()).filter(Boolean);
    }
    product.badge = badge || '';

    await product.save();
    res.redirect('/supplier/products?success=Product updated successfully!');
  } catch (error) {
    next(error);
  }
};

// Quick Stock Adjuster (AJAX or Form POST)
// Allows stock add (+1, +5, +10), stock remove (-1, -5, -10), or set exact stock
exports.adjustStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, amount, stock } = req.body;

    const query = req.session.user.role === 'admin'
      ? { _id: id }
      : { _id: id, supplier: req.session.user._id };

    const product = await Product.findOne(query);
    if (!product) {
      if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.status(404).json({ success: false, message: 'Product not found or permission denied' });
      }
      return res.redirect('/supplier/products?error=Product not found');
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
      ? `Added ${change} units to "${product.name}". New stock: ${product.stock}`
      : `Removed ${Math.abs(change)} units from "${product.name}". New stock: ${product.stock}`;

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

    res.redirect(`/supplier/products?success=${encodeURIComponent(message)}`);
  } catch (error) {
    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return res.status(500).json({ success: false, message: error.message });
    }
    next(error);
  }
};

// Supplier Order Items
exports.getOrders = async (req, res, next) => {
  try {
    const supplierId = req.session.user._id;
    const query = req.session.user.role === 'admin' ? {} : { supplier: supplierId };

    const products = await Product.find(query).select('_id name thumbnail price').lean();
    const productIds = products.map(p => p._id.toString());

    const allOrders = await Order.find({
      'orderItems.product': { $in: productIds }
    })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    // Filter orderItems in each order to only show those belonging to this supplier
    const supplierOrders = allOrders.map(order => {
      const relevantItems = order.orderItems.filter(item =>
        productIds.includes(item.product?.toString())
      );
      const supplierSubtotal = relevantItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      return {
        ...order,
        supplierItems: relevantItems,
        supplierSubtotal
      };
    });

    res.render('pages/supplier/orders', {
      title: 'Supplier Orders & Fulfillment',
      orders: supplierOrders,
      supplierName: req.session.user.supplierInfo?.companyName || req.session.user.name
    });
  } catch (error) {
    next(error);
  }
};
