const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 }
});

const trackingEventSchema = new mongoose.Schema({
  status: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  location: { type: String, default: 'Fulfillment Center' }
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    orderItems: [orderItemSchema],
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, default: 'United States' }
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['credit_card', 'upi', 'net_banking', 'cod'],
      default: 'credit_card'
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'paid'
    },
    paymentDetails: {
      transactionId: { type: String, default: () => 'TXN-' + Math.random().toString(36).substring(2, 10).toUpperCase() },
      paidAt: { type: Date, default: Date.now }
    },
    itemsPrice: { type: Number, required: true, default: 0.0 },
    taxPrice: { type: Number, required: true, default: 0.0 },
    shippingPrice: { type: Number, required: true, default: 0.0 },
    discountPrice: { type: Number, required: true, default: 0.0 },
    couponCode: { type: String, default: '' },
    totalPrice: { type: Number, required: true, default: 0.0 },
    orderStatus: {
      type: String,
      enum: ['pending', 'recieved', 'delivered', 'placed', 'processing', 'shipped', 'cancelled'],
      default: 'pending'
    },
    rider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    trackingEvents: [trackingEventSchema],
    estimatedDelivery: {
      type: Date,
      default: () => new Date(Date.now() + 4 * 24 * 60 * 60 * 1000)
    },
    isDelivered: { type: Boolean, default: false },
    deliveredAt: { type: Date }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Order', orderSchema);
