const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// Helper to generate readable order number e.g. ORD-2026-8921
const generateOrderNumber = () => {
  const timestamp = Date.now().toString().slice(-4);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${timestamp}-${random}`;
};

// Render checkout page
exports.getCheckout = async (req, res, next) => {
  try {
    const cart = req.session.cart;
    if (!cart || cart.items.length === 0) {
      return res.redirect('/cart?error=Your cart is empty');
    }

    const user = await User.findById(req.session.user._id).lean();
    const savedAddress = user.addresses && user.addresses.length > 0 ? user.addresses[0] : null;

    res.render('pages/checkout', {
      title: 'Checkout - Shopease',
      savedAddress,
      cart
    });
  } catch (error) {
    next(error);
  }
};

// Process Checkout & Place Order
exports.placeOrder = async (req, res, next) => {
  try {
    const cart = req.session.cart;
    if (!cart || cart.items.length === 0) {
      return res.redirect('/cart?error=Your cart is empty');
    }

    const {
      fullName,
      phone,
      street,
      city,
      state,
      postalCode,
      country = 'United States',
      paymentMethod = 'credit_card',
      saveAddress
    } = req.body;

    if (!fullName || !phone || !street || !city || !state || !postalCode) {
      return res.redirect('/checkout?error=Please fill in all required shipping address fields');
    }

    // Save address to user profile if requested
    if (saveAddress) {
      await User.findByIdAndUpdate(req.session.user._id, {
        $push: {
          addresses: {
            fullName,
            phone,
            street,
            city,
            state,
            postalCode,
            country,
            isDefault: true
          }
        }
      });
    }

    // Prepare order items
    const orderItems = cart.items.map(item => ({
      product: item.product,
      name: item.name,
      image: item.image,
      price: item.price,
      quantity: item.quantity
    }));

    // Inventory check & update
    for (const item of cart.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock = Math.max(0, product.stock - item.quantity);
        await product.save();
      }
    }

    // Create Order document
    const orderNumber = generateOrderNumber();
    const order = new Order({
      orderNumber,
      user: req.session.user._id,
      orderItems,
      shippingAddress: {
        fullName,
        phone,
        street,
        city,
        state,
        postalCode,
        country
      },
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
      paymentDetails: {
        transactionId: 'TXN-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
        paidAt: paymentMethod === 'cod' ? null : new Date()
      },
      itemsPrice: cart.subtotal,
      taxPrice: parseFloat((cart.subtotal * 0.05).toFixed(2)), // 5% standard tax
      shippingPrice: cart.shipping,
      discountPrice: cart.discount,
      couponCode: cart.coupon ? cart.coupon.code : '',
      totalPrice: cart.total,
      orderStatus: 'placed',
      trackingEvents: [
        {
          status: 'placed',
          message: 'Order received and confirmed by Shopease Fulfillment',
          timestamp: new Date(),
          location: 'Central Hub, TX'
        }
      ]
    });

    const savedOrder = await order.save();

    // Reset session cart
    req.session.cart = {
      items: [],
      totalQty: 0,
      subtotal: 0,
      discount: 0,
      shipping: 0,
      total: 0,
      coupon: null
    };

    res.redirect(`/order-success/${savedOrder._id}`);
  } catch (error) {
    next(error);
  }
};

// Order Success Confirmation Page
exports.getOrderSuccess = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).lean();
    if (!order) {
      return res.redirect('/orders');
    }

    res.render('pages/order-success', {
      title: 'Order Confirmed! - Shopease',
      order
    });
  } catch (error) {
    next(error);
  }
};

// User Order History
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.session.user._id })
      .sort({ createdAt: -1 })
      .lean();

    res.render('pages/orders', {
      title: 'My Orders - Shopease',
      orders
    });
  } catch (error) {
    next(error);
  }
};

// Single Order Details with Live Tracking Timeline
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .lean();

    if (!order) {
      return res.status(404).render('pages/404', {
        title: 'Order Not Found',
        path: req.originalUrl
      });
    }

    // Security check: only order owner or admin can view
    const isOwner = order.user._id.toString() === req.session.user._id.toString();
    const isAdmin = req.session.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).render('pages/403', {
        title: 'Unauthorized',
        message: 'You are not authorized to view this order.'
      });
    }

    // Determine current timeline progress index
    const statusSteps = ['placed', 'processing', 'shipped', 'delivered'];
    const currentStepIndex = statusSteps.indexOf(order.orderStatus);

    res.render('pages/order-detail', {
      title: `Order #${order.orderNumber} - Shopease`,
      order,
      statusSteps,
      currentStepIndex
    });
  } catch (error) {
    next(error);
  }
};
