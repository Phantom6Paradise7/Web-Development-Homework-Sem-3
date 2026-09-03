require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
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
const riderRoutes = require('./src/routes/riderRoutes');

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Enable trust proxy for Render / reverse proxies (enables secure cookies over HTTPS)
app.set('trust proxy', 1);

// HTTP Request logging
if (!isProduction) {
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

// Health Check endpoint for Render monitoring and zero-downtime deploys
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

async function startServer() {
  try {
    await connectDB();
  } catch (err) {
    console.error('[Shopease Server] Fatal: Could not connect to database. Server halting.');
    process.exit(1);
  }

  // Express Session with MongoStore reusing active Mongoose connection
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shopease_ecommerce';
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'shopease_default_session_secret_key',
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        client: mongoose.connection.getClient(),
        ttl: 14 * 24 * 60 * 60 // 14 days
      }),
      cookie: {
        maxAge: 14 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: 'lax',
        secure: isProduction
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
  app.use('/', riderRoutes);

  // Error Handling Middleware
  app.use(notFound);
  app.use(errorHandler);

  // Start server
  const server = app.listen(PORT, () => {
    console.log(`[Shopease Server] Running at http://localhost:${PORT}`);
    console.log(`[Shopease Server] Environment: ${process.env.NODE_ENV || 'development'}`);
  });

  // Graceful shutdown on SIGTERM / SIGINT for Render deploys
  const gracefulShutdown = () => {
    console.log('[Shopease Server] Received termination signal. Closing HTTP server...');
    server.close(() => {
      console.log('[Shopease Server] HTTP server closed cleanly.');
      process.exit(0);
    });
  };
  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
}

startServer();
