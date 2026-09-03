const Order = require('../models/Order');
const Product = require('../models/Product');

// Rider Dashboard Overview
exports.getRiderDashboard = async (req, res, next) => {
  try {
    const pendingOrdersCount = await Order.countDocuments({ orderStatus: 'pending' });
    const recievedOrdersCount = await Order.countDocuments({ orderStatus: 'recieved' });
    const deliveredOrdersCount = await Order.countDocuments({ orderStatus: 'delivered' });

    // Fetch up to 6 urgent active orders needing delivery
    const activeOrders = await Order.find({
      orderStatus: { $in: ['pending', 'recieved'] }
    })
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    res.render('pages/rider/dashboard', {
      title: 'Delivery Rider Fleet Dashboard - Shopease',
      pendingOrdersCount,
      recievedOrdersCount,
      deliveredOrdersCount,
      activeOrders
    });
  } catch (error) {
    next(error);
  }
};

// Rider Orders Delivery Management Table
exports.getRiderOrders = async (req, res, next) => {
  try {
    const filterStatus = req.query.status || 'all';
    const query = {};

    if (filterStatus === 'pending') {
      query.orderStatus = 'pending';
    } else if (filterStatus === 'recieved') {
      query.orderStatus = 'recieved';
    } else if (filterStatus === 'delivered') {
      query.orderStatus = 'delivered';
    }

    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .lean();

    res.render('pages/rider/orders', {
      title: 'Active Deliveries - Rider Fleet Portal',
      orders,
      filterStatus
    });
  } catch (error) {
    next(error);
  }
};

// Rider Status Update (pending -> recieved -> delivered)
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['recieved', 'delivered'].includes(status)) {
      if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.status(400).json({ success: false, message: 'Invalid delivery status' });
      }
      return res.redirect('/rider/orders?error=Invalid status');
    }

    const order = await Order.findById(id);
    if (!order) {
      if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
      return res.redirect('/rider/orders?error=Order not found');
    }

    const riderName = req.session.user ? req.session.user.name : 'Delivery Rider';

    if (status === 'recieved') {
      order.orderStatus = 'recieved';
      order.rider = req.session.user ? req.session.user._id : null;
      order.trackingEvents.push({
        status: 'recieved',
        message: `Order picked up and received by Rider ${riderName} - In Transit`,
        timestamp: new Date(),
        location: 'In Transit'
      });
    } else if (status === 'delivered') {
      order.orderStatus = 'delivered';
      order.isDelivered = true;
      order.deliveredAt = new Date();
      order.paymentStatus = 'paid';
      order.trackingEvents.push({
        status: 'delivered',
        message: `Package successfully delivered to customer by Rider ${riderName}`,
        timestamp: new Date(),
        location: `${order.shippingAddress.city}, ${order.shippingAddress.state}`
      });
    }

    await order.save();

    const msg = `Order ${order.orderNumber} status updated to "${status}".`;

    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return res.json({ success: true, message: msg, orderStatus: order.orderStatus });
    }

    res.redirect('/rider/orders?success=' + encodeURIComponent(msg));
  } catch (error) {
    next(error);
  }
};

// Rider Cancellation: Cancels and Permanently Removes from MongoDB (Requirement 3)
exports.cancelDelivery = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
      return res.redirect('/rider/orders?error=Order not found');
    }

    const orderNum = order.orderNumber;

    // Restore stock to catalog
    for (const item of order.orderItems) {
      if (item.product) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity }
        });
      }
    }

    // Permanently remove from database
    await Order.findByIdAndDelete(id);

    const msg = `Order ${orderNum} was cancelled and permanently removed from the database.`;

    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return res.json({ success: true, message: msg });
    }

    res.redirect('/rider/orders?info=' + encodeURIComponent(msg));
  } catch (error) {
    next(error);
  }
};
