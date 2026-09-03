const Product = require('../models/Product');
const Category = require('../models/Category');

// Home page
exports.getHome = async (req, res, next) => {
  try {
    const featuredProducts = await Product.find({ isFeatured: true }).limit(8).lean();
    const trendingProducts = await Product.find({ isTrending: true }).limit(8).lean();
    const topDeals = await Product.find({ discountPercent: { $gte: 15 } }).sort({ discountPercent: -1 }).limit(4).lean();
    const categories = await Category.find().lean();

    res.render('pages/home', {
      title: 'Shopease - Modern Online Shopping',
      featuredProducts,
      trendingProducts,
      topDeals,
      categories
    });
  } catch (error) {
    next(error);
  }
};

// Shop catalog with search, filters, sorting & pagination
exports.getShop = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 12;
    const skip = (page - 1) * limit;

    const { q, category, brand, minPrice, maxPrice, sort, rating, inStock } = req.query;

    let filter = {};

    // Keyword search across name, description, brand
    if (q && q.trim() !== '') {
      filter.$or = [
        { name: { $regex: q.trim(), $options: 'i' } },
        { description: { $regex: q.trim(), $options: 'i' } },
        { brand: { $regex: q.trim(), $options: 'i' } }
      ];
    }

    // Category filter
    if (category && category !== 'all') {
      filter.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    // Brand filter
    if (brand && brand !== 'all') {
      filter.brand = brand;
    }

    // In Stock Only filter
    if (inStock === 'true' || inStock === '1') {
      filter.stock = { $gt: 0 };
    }

    // Rating filter
    if (rating) {
      filter.ratings = { $gte: Number(rating) };
    }

    // Price range
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Sorting
    let sortOption = { createdAt: -1 };
    if (sort === 'price-asc') sortOption = { price: 1 };
    else if (sort === 'price-desc') sortOption = { price: -1 };
    else if (sort === 'rating') sortOption = { ratings: -1 };
    else if (sort === 'popular') sortOption = { numReviews: -1 };

    const totalProducts = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean();

    const totalPages = Math.ceil(totalProducts / limit);

    // Get available brands for the filter sidebar
    const brands = await Product.distinct('brand');
    const categories = await Category.find().lean();

    res.render('pages/shop', {
      title: 'Shop Products - Shopease',
      products,
      categories,
      brands,
      currentPage: page,
      totalPages,
      totalProducts,
      activeFilters: {
        q: q || '',
        category: category || 'all',
        brand: brand || 'all',
        minPrice: minPrice || '',
        maxPrice: maxPrice || '',
        sort: sort || 'newest',
        rating: rating || '',
        inStock: inStock || ''
      }
    });
  } catch (error) {
    next(error);
  }
};

// Single product details
exports.getProductBySlug = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) {
      return res.status(404).render('pages/404', {
        title: 'Product Not Found',
        path: req.originalUrl
      });
    }

    // Get related products from same category
    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id }
    })
      .limit(4)
      .lean();

    res.render('pages/product-detail', {
      title: `${product.name} - Shopease`,
      product,
      relatedProducts
    });
  } catch (error) {
    next(error);
  }
};

// Add product review
exports.addReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.redirect('/shop?error=Product not found');
    }

    // Check if user already reviewed
    const alreadyReviewed = product.reviews.find(
      r => r.user.toString() === req.session.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.redirect(`/product/${product.slug}?error=You have already reviewed this product`);
    }

    const review = {
      user: req.session.user._id,
      name: req.session.user.name,
      rating: Number(rating),
      comment,
      isVerifiedPurchase: true
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.ratings =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    // Round to 1 decimal place
    product.ratings = Math.round(product.ratings * 10) / 10;

    await product.save();
    res.redirect(`/product/${product.slug}?success=Thank you! Your review has been published.`);
  } catch (error) {
    next(error);
  }
};

// JSON API endpoint for live instant search dropdown
exports.apiLiveSearch = async (req, res) => {
  try {
    const q = req.query.q || '';
    if (!q.trim()) {
      return res.json([]);
    }

    const products = await Product.find({
      $or: [
        { name: { $regex: q.trim(), $options: 'i' } },
        { category: { $regex: q.trim(), $options: 'i' } },
        { brand: { $regex: q.trim(), $options: 'i' } }
      ]
    })
      .select('name slug price thumbnail category discountPercent originalPrice')
      .limit(6)
      .lean();

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// JSON API endpoint for Product Quick View Modal
exports.apiQuickView = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({
      success: true,
      product: {
        _id: product._id,
        name: product.name,
        slug: product.slug,
        brand: product.brand,
        category: product.category,
        supplierName: product.supplierName || 'Shopease Official',
        price: product.price,
        originalPrice: product.originalPrice,
        discountPercent: product.discountPercent,
        stock: product.stock,
        thumbnail: product.thumbnail,
        images: product.images && product.images.length > 0 ? product.images : [product.thumbnail],
        description: product.description,
        features: product.features || [],
        specs: product.specs || [],
        ratings: product.ratings || 5,
        numReviews: product.numReviews || 0,
        badge: product.badge || ''
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
