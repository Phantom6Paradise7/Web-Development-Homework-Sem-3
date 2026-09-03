require('dotenv').config();
const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const methodOverride = require('method-override');
const morgan = require('morgan');

const connectDB = require('./src/config/db');
const initCartAndLocals = require('./src/middleware/cart');
const { notFound, errorHandler } = require('./src/middleware/errorHandler');

// Route imports
const productRoutes = require('./src/routes/productRoutes');
const cartRoutes = require('./src/routes/cartRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const authRoutes = require('./src/routes/authRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const supplierRoutes = require('./src/routes/supplierRoutes');

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shopease_ecommerce';

// HTTP Request logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Method override for PUT / DELETE in HTML forms
app.use(methodOverride('_method'));

// Static assets
app.use(express.static(path.join(__dirname, 'public')));

// EJS Template Engine & Layouts
app.use(expressLayouts);
app.set('layout', 'layouts/main');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Express Session with MongoStore
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'shopease_default_session_secret_key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: mongoUri,
      ttl: 14 * 24 * 60 * 60 // 14 days
    }),
    cookie: {
      maxAge: 14 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    }
  })
);

// Global cart and response locals middleware
app.use(initCartAndLocals);

// Mount Application Routes
app.use('/', productRoutes);
app.use('/', cartRoutes);
app.use('/', orderRoutes);
app.use('/', authRoutes);
app.use('/', adminRoutes);
app.use('/', supplierRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`[Shopease Server] Running at http://localhost:${PORT}`);
  console.log(`[Shopease Server] Environment: ${process.env.NODE_ENV || 'development'}`);
});
