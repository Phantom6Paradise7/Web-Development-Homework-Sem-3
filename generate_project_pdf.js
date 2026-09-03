const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { COMMON_CSS, CHROME_PATH, OUTPUT_DIR } = require('./pdf_config');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Shopease Project Architecture & Code Deep Dive</title>
  <style>
    ${COMMON_CSS}
  </style>
</head>
<body>

  <!-- Cover Header -->
  <div class="header-cover">
    <h1>Shopease E-Commerce Platform</h1>
    <div class="subtitle">Comprehensive System Architecture, File-by-File Breakdown &amp; Crucial Code Explanations</div>
    <div>
      <span class="meta-tag">Node.js / Express</span>
      <span class="meta-tag">MongoDB / Mongoose</span>
      <span class="meta-tag">EJS Server-Side Rendering</span>
      <span class="meta-tag">Multi-Role RBAC</span>
      <span class="meta-tag">Live Production on Render.com</span>
    </div>
  </div>

  <!-- Table of Contents -->
  <div class="callout">
    <div class="callout-title">Document Scope &amp; Contents</div>
    <p>This document provides an exhaustive, engineering-grade walkthrough of the entire Shopease codebase. Every directory, model, controller, route, middleware, view template, client-side script, stylesheet, and deployment configuration is thoroughly explained with its architectural justification and crucial code snippets.</p>
  </div>

  <h2>1. Executive Summary &amp; High-Level Architecture</h2>
  <p><strong>Shopease</strong> is a full-stack, enterprise-patterned multi-vendor e-commerce platform built on the <strong>Model-View-Controller (MVC)</strong> architectural pattern. Unlike basic single-user shopping carts, Shopease supports three distinct user roles (Customer, Merchant Admin, and Supplier Partner), complete catalog management, real-time inventory adjustments, a live flash deal coupon engine, a Quick View modal system, and a live production deployment on Render.com backed by MongoDB Atlas.</p>

  <table>
    <thead>
      <tr>
        <th>Layer</th>
        <th>Technologies Used</th>
        <th>Key Responsibilities</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Backend Runtime</strong></td>
        <td>Node.js (v18+), Express.js (v4.22)</td>
        <td>HTTP routing, session auth, API endpoints, SSR view rendering, reverse proxy trust.</td>
      </tr>
      <tr>
        <td><strong>Database &amp; ODM</strong></td>
        <td>MongoDB Atlas (Cloud), Mongoose (v8.24)</td>
        <td>Document persistence, relational schema references (ObjectId), pre-save bcrypt hooks, connection pooling.</td>
      </tr>
      <tr>
        <td><strong>Session &amp; Auth</strong></td>
        <td><code>express-session</code>, <code>connect-mongo</code>, <code>bcryptjs</code></td>
        <td>Encrypted HTTP-only cookie sessions stored in MongoDB Atlas, salted one-way password hashing.</td>
      </tr>
      <tr>
        <td><strong>Frontend &amp; Templating</strong></td>
        <td>EJS, <code>express-ejs-layouts</code>, Vanilla CSS3, Client-side ES6 JS</td>
        <td>Semantic HTML5, layout inheritance, CSS custom properties, AJAX DOM hydration, HTML5 <code>&lt;dialog&gt;</code>.</td>
      </tr>
      <tr>
        <td><strong>Cloud Deployment</strong></td>
        <td>Render.com (Web Service), Git, <code>render.yaml</code> Blueprint</td>
        <td>Automated CI/CD git-push deployments, zero-downtime health checking (<code>/health</code>), SSL termination.</td>
      </tr>
    </tbody>
  </table>

  <h2>2. Complete Project Directory &amp; File Tree</h2>
  <pre><code>/Users/mansabhatt/Desktop/My-Project/
├── server.js                          # Core application entrypoint &amp; server lifecycle
├── package.json                       # Dependencies, engines, and run scripts
├── render.yaml                        # Render.com Infrastructure-as-Code Blueprint
├── DEPLOYMENT.md                      # Comprehensive cloud deployment walkthrough
├── .env / .env.example                # Environment variable configuration templates
├── src/
│   ├── config/
│   │   └── db.js                      # MongoDB connection pooling &amp; development fallback
│   ├── models/
│   │   ├── User.js                    # User schema (Customer/Admin/Supplier, bcrypt hooks)
│   │   ├── Product.js                 # Product catalog schema (supplier refs, images, stock)
│   │   ├── Category.js                # Category schema (slugs, icons, banners, itemCount)
│   │   └── Order.js                   # Order schema (order items, tracking timeline, status)
│   ├── middleware/
│   │   ├── auth.js                    # RBAC route guards (ensureAuth, ensureAdmin, ensureSupplier)
│   │   ├── cart.js                    # Global cart calculator &amp; view locals injector (res.locals)
│   │   └── errorHandler.js            # 404 handler and centralized production error handler
│   ├── controllers/
│   │   ├── authController.js          # Authentication, role redirection, customer/supplier signup
│   │   ├── productController.js       # Catalog browsing, multi-filter query, Quick View API, search API
│   │   ├── supplierController.js      # Supplier dashboard, inventory list, 1-click stock adjuster, orders
│   │   ├── adminController.js         # Executive metrics, Category Studio CRUD, supplier directory
│   │   └── cartController.js          # Session cart management, coupon engine (SAVE20), checkout
│   ├── routes/
│   │   ├── authRoutes.js              # Login, register, logout endpoints
│   │   ├── productRoutes.js           # Home, shop catalog, product details, search/quickview APIs
│   │   ├── supplierRoutes.js          # /supplier/* scoped portal routes
│   │   ├── adminRoutes.js             # /admin/* scoped console routes
│   │   ├── cartRoutes.js              # /cart/* cart manipulation endpoints
│   │   └── orderRoutes.js             # /checkout, /orders, /orders/:id tracking
│   └── seeds/
│       └── seed.js                    # Automated seeder (8 categories, 16 products, 3 role accounts)
├── views/
│   ├── layouts/
│   │   └── main.ejs                   # Base HTML document, navigation, dialog container, scripts
│   ├── partials/
│   │   ├── navbar.ejs                 # Role-aware header, category sub-nav, counters, user menu
│   │   ├── footer.ejs                 # Marketplace footer with links, copyright &amp; payment badges
│   │   ├── alerts.ejs                 # Toast &amp; flash banner notifications
│   │   └── product-card.ejs           # Card component with Quick View trigger &amp; live stock pills
│   └── pages/
│       ├── home.ejs                   # Hero spotlight, 8 department cards, ticking deal countdown
│       ├── shop.ejs                   # Catalog filter sidebar (categories, brands, price, in-stock)
│       ├── product-detail.ejs         # Gallery, verified supplier box, on-page vendor stock controls
│       ├── cart.ejs                   # Shopping cart table, promo coupon box, summary pricing
│       ├── checkout.ejs               # Shipping details, payment selector, order confirmation
│       ├── orders.ejs                 # Order history &amp; order tracking timeline view
│       ├── 404.ejs &amp; 403.ejs          # Error and unauthorized access pages
│       ├── auth/
│       │   ├── login.ejs              # 3-Way role tab switcher &amp; 1-click demo login buttons
│       │   └── register.ejs           # Customer vs Supplier Partner registration form
│       ├── admin/
│       │   ├── dashboard.ejs          # Executive KPIs (Gross sales, orders, suppliers, restock alerts)
│       │   ├── products.ejs           # Admin catalog inventory with 1-click stock stepper
│       │   ├── categories.ejs         # Category Studio CRUD interface
│       │   ├── suppliers.ejs          # Certified vendor partner directory
│       │   └── orders.ejs             # Global order fulfillment manager
│       └── supplier/
│           ├── dashboard.ejs          # Vendor operational metrics &amp; restock warnings
│           ├── products.ejs           # Vendor inventory table with 1-click +/- steppers
│           ├── product-form.ejs       # Add / Edit product listing form
│           └── orders.ejs             # Supplier item-level fulfillment view
└── public/
    ├── css/
    │   └── main.css                   # Custom CSS variables, responsive grid, glassmorphism, badges
    └── js/
        └── main.js                    # AJAX Quick View fetch, stock stepper handler, countdown clock</code></pre>

  <div class="page-break"></div>

  <h2>3. File-by-File Technical Deep Dive &amp; Crucial Code Snippets</h2>

  <!-- 3.1 server.js -->
  <h3>3.1 <code>server.js</code> &mdash; Application Entrypoint &amp; Server Lifecycle</h3>
  <p><strong>Purpose:</strong> Initializes the Express server, mounts global middlewares, handles database connection, configures reverse proxy trust for Render, binds HTTP routes, and establishes graceful shutdown listeners.</p>

  <div class="code-box">
    <div class="code-box-header">
      <span>server.js (Crucial Snippet: Reverse Proxy Trust &amp; Session Store)</span>
      <span>Express + MongoStore</span>
    </div>
    <pre><code>// Enable reverse proxy trust for Render.com (enables secure HTTPS cookies)
app.set('trust proxy', 1);

// Express Session with MongoStore reusing active Mongoose connection
const isProduction = process.env.NODE_ENV === 'production';
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'shopease_default_session_secret_key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      client: mongoose.connection.getClient(),
      ttl: 14 * 24 * 60 * 60 // 14-day persistent sessions in MongoDB Atlas
    }),
    cookie: {
      maxAge: 14 * 24 * 60 * 60 * 1000,
      httpOnly: true, // Mitigates XSS cookie theft
      sameSite: 'lax', // Protects against CSRF attacks
      secure: isProduction // Transmitted only over HTTPS in production
    }
  })
);

// Zero-downtime Health Check endpoint for Render.com orchestrator
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});</code></pre>
    <div class="code-explanation">
      <strong>Why this code is crucial:</strong>
      <ul>
        <li><code>app.set('trust proxy', 1)</code>: Render terminates TLS at its cloud load balancer. Express receives the connection over an internal proxy. Without this line, Express considers the connection unencrypted HTTP and refuses to set <code>secure</code> cookies, breaking logins.</li>
        <li><code>client: mongoose.connection.getClient()</code>: Reuses the existing MongoDB connection pool instead of opening an unneeded second connection to MongoDB Atlas.</li>
        <li><code>GET /health</code>: Queried by Render's health checker before redirecting live traffic to a new build.</li>
      </ul>
    </div>
  </div>

  <!-- 3.2 src/config/db.js -->
  <h3>3.2 <code>src/config/db.js</code> &mdash; Resilient Database Connection</h3>
  <p><strong>Purpose:</strong> Connects to MongoDB Atlas using Mongoose with resilient fallback to local MongoDB in development if remote credentials fail.</p>
  <div class="code-box">
    <div class="code-box-header">
      <span>src/config/db.js (Crucial Snippet: Connection &amp; Fallback)</span>
      <span>Mongoose Connection</span>
    </div>
    <pre><code>const connectDB = async () => {
  const primaryUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shopease_ecommerce';
  const localFallback = 'mongodb://127.0.0.1:27017/shopease_ecommerce';

  try {
    const conn = await mongoose.connect(primaryUri);
    console.log(\`[MongoDB] Connected successfully: \${conn.connection.host}/\${conn.connection.name}\`);
    return conn;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production' && primaryUri !== localFallback) {
      console.warn(\`[MongoDB] Falling back to local MongoDB: \${localFallback}...\`);
      const localConn = await mongoose.connect(localFallback);
      return localConn;
    }
    throw error;
  }
};</code></pre>
  </div>

  <!-- 3.3 Models -->
  <h3>3.3 Data Layer &mdash; <code>src/models/</code></h3>

  <h4><code>User.js</code> &mdash; Multi-Role User Schema &amp; Password Hashing</h4>
  <p>Supports three user roles: <code>'customer'</code>, <code>'admin'</code>, and <code>'supplier'</code>. Contains nested <code>supplierInfo</code> for merchant business credentials.</p>
  <div class="code-box">
    <div class="code-box-header">
      <span>src/models/User.js (Crucial Snippet: Bcrypt Pre-Save Middleware Hook)</span>
      <span>Mongoose + Bcrypt</span>
    </div>
    <pre><code>const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['customer', 'admin', 'supplier'],
    default: 'customer'
  },
  supplierInfo: {
    companyName: String,
    storeName: String,
    phone: String,
    address: String,
    isVerified: { type: Boolean, default: false }
  },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
}, { timestamps: true });

// Pre-save hook: Hashes password with 10 salt rounds before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method to compare candidate password during login
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};</code></pre>
    <div class="code-explanation">
      <strong>Why this code is crucial:</strong> Passwords are never stored in plain text. The <code>isModified('password')</code> guard ensures passwords are only hashed when created or updated, preventing double-hashing on profile edits.
    </div>
  </div>

  <div class="page-break"></div>

  <h4><code>Product.js</code> &mdash; Catalog Schema with Supplier Ownership</h4>
  <p>Stores pricing, discounts, multi-angle images, specifications, ratings, and explicit relational ownership via <code>supplier: { type: ObjectId, ref: 'User' }</code>.</p>
  <div class="code-box">
    <div class="code-box-header">
      <span>src/models/Product.js</span>
      <span>Product Schema</span>
    </div>
    <pre><code>const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  brand: { type: String, required: true },
  category: { type: String, required: true, index: true },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  supplierName: { type: String, default: 'Shopease Official' },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  discountPercent: { type: Number, default: 0 },
  stock: { type: Number, required: true, default: 0 },
  thumbnail: { type: String, required: true },
  images: [{ type: String }],
  description: { type: String, required: true },
  features: [{ type: String }],
  specs: [{ key: String, value: String }],
  ratings: { type: Number, default: 5.0 },
  numReviews: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false }
}, { timestamps: true });</code></pre>
  </div>

  <h4><code>Category.js</code> &amp; <code>Order.js</code></h4>
  <ul>
    <li><strong><code>Category.js</code>:</strong> Contains <code>slug</code>, <code>icon</code> (emoji), <code>image</code> (Unsplash cover photo), <code>bannerImage</code>, <code>itemCount</code> (cached product count for O(1) rendering), and <code>isFeatured</code>.</li>
    <li><strong><code>Order.js</code>:</strong> Contains <code>orderItems</code> array (referencing <code>Product</code>), <code>totalPrice</code>, <code>shippingAddress</code>, <code>paymentMethod</code>, <code>orderStatus</code>, and an audit array <code>trackingEvents: [{ status, message, timestamp, location }]</code>.</li>
  </ul>

  <!-- 3.4 Middleware -->
  <h3>3.4 Middleware Layer &mdash; <code>src/middleware/</code></h3>

  <h4><code>auth.js</code> &mdash; Role-Based Access Control (RBAC) Guards</h4>
  <div class="code-box">
    <div class="code-box-header">
      <span>src/middleware/auth.js (Crucial Snippet: Role Gatekeepers)</span>
      <span>RBAC Guards</span>
    </div>
    <pre><code>// Admin Gatekeeper
const ensureAdmin = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  return res.status(403).render('pages/403', {
    title: 'Access Denied',
    message: 'You need administrator privileges to access this console.'
  });
};

// Supplier Gatekeeper (Accessible by Suppliers and Admins)
const ensureSupplier = (req, res, next) => {
  if (req.session && req.session.user && 
     (req.session.user.role === 'supplier' || req.session.user.role === 'admin')) {
    return next();
  }
  return res.status(403).render('pages/403', {
    title: 'Access Denied',
    message: 'You need an authorized Supplier or Admin account to access this portal.'
  });
};</code></pre>
  </div>

  <h4><code>cart.js</code> &mdash; Global Session Cart &amp; View Locals Injector</h4>
  <p>Executes on <strong>every incoming request</strong>. It calculates live cart totals, applies coupons (e.g. <code>SAVE20</code>), enforces the $50 free shipping threshold, and binds variables to <code>res.locals</code> so navbar badges and session state are accessible in all EJS templates without passing them manually in every controller.</p>
  <div class="code-box">
    <div class="code-box-header">
      <span>src/middleware/cart.js (Crucial Snippet: Cart &amp; res.locals)</span>
      <span>Cart Engine</span>
    </div>
    <pre><code>const initCartAndLocals = async (req, res, next) => {
  if (!req.session.cart) {
    req.session.cart = { items: [], totalQty: 0, subtotal: 0, discount: 0, shipping: 0, total: 0, coupon: null };
  }
  const cart = req.session.cart;
  let totalQty = 0, subtotal = 0;
  cart.items.forEach(i => { totalQty += i.quantity; subtotal += i.price * i.quantity; });
  cart.totalQty = totalQty;
  cart.subtotal = parseFloat(subtotal.toFixed(2));

  // 20% Promo discount calculation
  let discount = 0;
  if (cart.coupon && cart.coupon.type === 'percentage') {
    discount = (subtotal * cart.coupon.value) / 100;
  }
  cart.discount = parseFloat(Math.min(discount, subtotal).toFixed(2));

  // Free shipping over $50
  cart.shipping = (cart.subtotal > 50 || cart.subtotal === 0) ? 0 : 9.99;
  cart.total = parseFloat(Math.max(0, cart.subtotal - cart.discount + cart.shipping).toFixed(2));

  // Global variables accessible in all EJS files
  res.locals.cart = cart;
  res.locals.currentUser = req.session.user || null;
  res.locals.navCategories = await Category.find().sort({ name: 1 }).lean();
  next();
};</code></pre>
  </div>

  <div class="page-break"></div>

  <!-- 3.5 Controllers -->
  <h3>3.5 Controllers &mdash; <code>src/controllers/</code></h3>

  <h4><code>supplierController.js</code> &mdash; 1-Click Stock Adjuster &amp; Scoped Catalog</h4>
  <p>Suppliers can only view and mutate products they own (<code>supplier: req.session.user._id</code>). Admins can mutate any catalog item.</p>
  <div class="code-box">
    <div class="code-box-header">
      <span>src/controllers/supplierController.js (Crucial Snippet: 1-Click Stock Adjustment)</span>
      <span>Stock Increment / Decrement API</span>
    </div>
    <pre><code>exports.adjustStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, amount, stock } = req.body; // action: 'add' | 'remove' | 'set'

    // Restrict query to supplier's items unless admin
    const filter = { _id: id };
    if (req.session.user.role !== 'admin') {
      filter.supplier = req.session.user._id;
    }

    const product = await Product.findOne(filter);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found or unauthorized' });

    const oldStock = product.stock;
    if (action === 'add') {
      product.stock = Math.max(0, product.stock + (parseInt(amount) || 1));
    } else if (action === 'remove') {
      product.stock = Math.max(0, product.stock - (parseInt(amount) || 1));
    } else if (action === 'set') {
      product.stock = Math.max(0, parseInt(stock) || 0);
    }
    await product.save();

    const change = product.stock - oldStock;
    const msg = \`\${change >= 0 ? 'Added' : 'Removed'} \${Math.abs(change)} units. New stock: \${product.stock}\`;

    // Respond with JSON for AJAX or redirect for HTML form POST
    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return res.json({ success: true, productId: product._id, newStock: product.stock, oldStock, change, message: msg });
    }
    res.redirect('/supplier/products?success=' + encodeURIComponent(msg));
  } catch (error) {
    res.status(500).json({ success: false, message: 'Stock update failed' });
  }
};</code></pre>
  </div>

  <h4><code>productController.js</code> &mdash; Quick View API &amp; Multi-Filter Engine</h4>
  <ul>
    <li><strong><code>apiQuickView</code>:</strong> Returns a compact JSON representation of a product (all high-res image angles, live stock, specifications, verified supplier name, price) to hydrate the HTML5 <code>&lt;dialog&gt;</code> without page reload.</li>
    <li><strong><code>getShop</code>:</strong> Implements compound MongoDB queries with keyword search regex, category filter, brand match, price ranges (<code>$gte</code>, <code>$lte</code>), customer ratings filter, in-stock only filter (<code>stock: { $gt: 0 }</code>), and pagination.</li>
    <li><strong><code>apiSearch</code>:</strong> Provides debounced live autocomplete search over product titles and brands.</li>
  </ul>

  <h4><code>adminController.js</code> &mdash; Command Center &amp; Category Studio</h4>
  <ul>
    <li><strong>Executive Dashboard (<code>getDashboard</code>):</strong> Computes gross sales via MongoDB aggregation over paid orders, total orders, active catalog units, low-stock warnings (<code>stock &lt;= 5</code>), and verified vendor partners count.</li>
    <li><strong>Category Studio:</strong> Complete CRUD controller allowing admins to create, edit, visual preview, and delete store departments.</li>
  </ul>

  <!-- 3.6 Frontend Views -->
  <h3>3.6 Frontend Views &amp; Client-Side Interactivity</h3>

  <h4><code>views/partials/product-card.ejs</code></h4>
  <p>Features secondary image hover transitions, dynamic stock status badges (<code>● In Stock</code> vs <code>⚠️ Only X left</code> vs <code>✕ Sold Out</code>), verified supplier attribution (<code>🏭 Sold by: Apex Global Supplies</code>), and a floating Quick View trigger button.</p>

  <h4><code>public/js/main.js</code> &mdash; Client-Side Micro-Interactions</h4>
  <div class="code-box">
    <div class="code-box-header">
      <span>public/js/main.js (Crucial Snippet: Quick View Modal Hydration &amp; Stock Stepper)</span>
      <span>Vanilla ES6 JavaScript</span>
    </div>
    <pre><code>// 1. Quick View Modal Hydration
function initQuickViewModal() {
  const modal = document.getElementById('quickViewModal');
  const modalBody = document.getElementById('quickViewModalBody');

  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('.quick-view-btn');
    if (!btn) return;
    e.preventDefault();
    const productId = btn.dataset.productId;
    modal.showModal(); // Opens native HTML5 dialog with backdrop

    const res = await fetch(\`/api/products/\${productId}/quickview\`);
    const data = await res.json();
    if (data.success) {
      // Injects multi-image thumbnail switcher, live stock pills, and AJAX add-to-cart
      renderQuickViewDOM(data.product);
    }
  });
}

// 2. Asynchronous 1-Click Stock Adjuster (Add / Remove / Set)
function initStockAdjusters() {
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('.btn-stock-adjust') || e.target.closest('.btn-stock-set');
    if (!btn) return;
    e.preventDefault();
    const widget = btn.closest('.stock-action-widget');
    const endpoint = widget.dataset.endpoint;
    const action = btn.dataset.action; // 'add' | 'remove' | 'set'
    const amount = btn.dataset.amount || null;
    const stockVal = action === 'set' ? widget.querySelector('.stock-direct-input').value : null;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ action, amount, stock: stockVal })
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message, 'success');
      // Updates table stock badge pill and input without full page refresh
      updateStockBadgeDOM(data.productId, data.newStock);
    }
  });
}</code></pre>
  </div>

  <div class="page-break"></div>

  <!-- 3.7 Database Seeding & Deployment -->
  <h3>3.7 Database Seeding &amp; Cloud Deployment</h3>

  <h4><code>src/seeds/seed.js</code></h4>
  <p>Automated seeder that flushes existing data and creates:</p>
  <ul>
    <li><strong>8 Curated Departments:</strong> Electronics, Fashion, Footwear, Home &amp; Living, Accessories, Beauty &amp; Skincare, Sports &amp; Outdoors, Workstation &amp; Gaming.</li>
    <li><strong>3 Pre-Configured Role Accounts:</strong>
      <ul>
        <li><code>admin@store.com</code> / <code>admin123</code> (Role: <code>admin</code>)</li>
        <li><code>supplier@apex.com</code> / <code>supplier123</code> (Role: <code>supplier</code>)</li>
        <li><code>john@example.com</code> / <code>customer123</code> (Role: <code>customer</code>)</li>
      </ul>
    </li>
    <li><strong>16 Multi-Image Products:</strong> Complete with high-resolution Unsplash images, features, technical specifications, initial warehouse stock counts, and verified seller attributions.</li>
    <li><strong>Sample Orders:</strong> Initial order items with tracking events timeline.</li>
  </ul>

  <h4><code>render.yaml</code> &mdash; Infrastructure as Code for Render.com</h4>
  <div class="code-box">
    <div class="code-box-header">
      <span>render.yaml (Render Blueprint)</span>
      <span>YAML Specification</span>
    </div>
    <pre><code>services:
  - type: web
    name: shopease-ecommerce
    runtime: node
    plan: free
    buildCommand: npm install
    startCommand: npm start
    healthCheckPath: /health
    autoDeploy: true
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: SESSION_SECRET
        generateValue: true
      - key: MONGODB_URI
        sync: false</code></pre>
  </div>

  <div class="callout" style="border-left-color: #10b981; background: #ecfdf5; margin-top: 20px;">
    <div class="callout-title" style="color: #059669;">Verified Production Deployment</div>
    <p>The application is live and accessible at: <br>
    <strong><a href="https://web-development-homework-sem-3-1.onrender.com" target="_blank">https://web-development-homework-sem-3-1.onrender.com</a></strong><br>
    The production instance runs Node.js connected to MongoDB Atlas over TLS, with zero-downtime rolling deploys triggered via GitHub push.</p>
  </div>

</body>
</html>`;

const htmlFilePath = path.join('/tmp', 'shopease_project_architecture.html');
const pdfFilePath = path.join(OUTPUT_DIR, 'Shopease_Project_Architecture_and_Code_Walkthrough.pdf');

fs.writeFileSync(htmlFilePath, htmlContent, 'utf8');
console.log('HTML written to:', htmlFilePath);

const cmd = `"${CHROME_PATH}" --headless --disable-gpu --print-to-pdf="${pdfFilePath}" --no-pdf-header-footer "${htmlFilePath}"`;
console.log('Executing Chrome PDF conversion...');
execSync(cmd, { stdio: 'inherit' });
console.log('PDF 1 created successfully:', pdfFilePath);
