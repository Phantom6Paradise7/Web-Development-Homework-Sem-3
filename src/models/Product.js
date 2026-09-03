const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: true
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter product name'],
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    brand: {
      type: String,
      required: [true, 'Please enter brand name'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      trim: true
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    supplierName: {
      type: String,
      default: 'Shopease Official'
    },
    description: {
      type: String,
      required: [true, 'Please enter product description']
    },
    features: [
      {
        type: String
      }
    ],
    specs: [
      {
        key: String,
        value: String
      }
    ],
    price: {
      type: Number,
      required: [true, 'Please enter product price'],
      min: 0
    },
    originalPrice: {
      type: Number,
      default: function () {
        return this.price;
      }
    },
    discountPercent: {
      type: Number,
      default: 0
    },
    stock: {
      type: Number,
      required: [true, 'Please enter stock count'],
      default: 10,
      min: 0
    },
    images: [
      {
        type: String,
        required: true
      }
    ],
    thumbnail: {
      type: String,
      required: true
    },
    ratings: {
      type: Number,
      default: 0
    },
    numReviews: {
      type: Number,
      default: 0
    },
    reviews: [reviewSchema],
    isFeatured: {
      type: Boolean,
      default: false
    },
    isTrending: {
      type: Boolean,
      default: false
    },
    badge: {
      type: String,
      default: '' // e.g. "Best Seller", "New", "20% OFF"
    }
  },
  {
    timestamps: true
  }
);

// Calculate discount automatically if not provided
productSchema.pre('save', function (next) {
  if (this.originalPrice > this.price && (!this.discountPercent || this.discountPercent === 0)) {
    this.discountPercent = Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
