const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { COMMON_CSS, CHROME_PATH, OUTPUT_DIR } = require('./pdf_config');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Shopease E-Commerce - Viva & Technical Interview Guide</title>
  <style>
    ${COMMON_CSS}
  </style>
</head>
<body>

  <!-- Cover Header -->
  <div class="header-cover" style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #334155 100%);">
    <h1>Shopease E-Commerce Platform</h1>
    <div class="subtitle">Comprehensive Viva, Practical Exam &amp; Technical Interview Preparation Guide</div>
    <div>
      <span class="meta-tag">30+ In-Depth Questions</span>
      <span class="meta-tag">Code-Grounded Answers</span>
      <span class="meta-tag">Full-Stack Node/Express/MongoDB</span>
      <span class="meta-tag">Security &amp; Cloud DevOps</span>
    </div>
  </div>

  <div class="callout">
    <div class="callout-title">Examiner &amp; Interview Focus</div>
    <p>This guide contains the most critical technical questions an external examiner, professor, or technical interviewer will ask about the Shopease codebase. Each answer provides the exact theoretical concept combined with direct code references from this project.</p>
  </div>

  <!-- SECTION 1 -->
  <h2>Section 1: Architecture, Design Patterns &amp; Project Structure</h2>

  <div class="qa-card highlight">
    <div class="qa-title"><span class="qa-num">Q1</span> What architectural pattern does Shopease follow and how is the codebase structured?</div>
    <div class="qa-body">
      <strong>Answer:</strong> Shopease strictly follows the <strong>Model-View-Controller (MVC)</strong> architectural pattern:
      <ul>
        <li><strong>Model (<code>src/models/</code>):</strong> Defines Mongoose schemas, data validation, indices, and business methods (e.g. <code>User.js</code>, <code>Product.js</code>, <code>Category.js</code>, <code>Order.js</code>).</li>
        <li><strong>View (<code>views/</code>):</strong> Server-side rendered EJS templates organized into shared layouts (<code>views/layouts/main.ejs</code>), reusable partials (<code>views/partials/navbar.ejs</code>, <code>product-card.ejs</code>), and domain pages (<code>home.ejs</code>, <code>shop.ejs</code>, <code>admin/</code>, <code>supplier/</code>).</li>
        <li><strong>Controller (<code>src/controllers/</code>):</strong> Contains request handlers, database queries, and response rendering logic (e.g. <code>productController.js</code>, <code>supplierController.js</code>, <code>adminController.js</code>).</li>
      </ul>
      Routes in <code>src/routes/</code> decouple URL endpoint declarations from controller logic, and reusable middleware in <code>src/middleware/</code> handles cross-cutting concerns (auth guards, session cart calculations, error handling).
    </div>
  </div>

  <div class="qa-card">
    <div class="qa-title"><span class="qa-num">Q2</span> Why did you choose Server-Side Rendering (SSR with EJS) instead of a Single-Page Application (SPA with React/Vue) for this project?</div>
    <div class="qa-body">
      <strong>Answer:</strong> 
      <ol>
        <li><strong>Search Engine Optimization (SEO):</strong> E-commerce product catalogs depend heavily on web crawlers (Google, Bing). With SSR, search engines receive fully hydrated semantic HTML on the initial HTTP request without executing client-side JavaScript bundles.</li>
        <li><strong>Largest Contentful Paint (LCP) &amp; Fast Initial Load:</strong> The browser renders the HTML and CSS immediately without waiting to download, parse, and execute multi-megabyte JavaScript single-page application bundles.</li>
        <li><strong>Architectural Simplicity:</strong> State is maintained securely on the server via authenticated sessions and MongoDB, eliminating the overhead of managing complex client-side state stores (Redux, Pinia) or token refresh cycles.</li>
      </ol>
    </div>
  </div>

  <div class="qa-card">
    <div class="qa-title"><span class="qa-num">Q3</span> How does layout inheritance work with <code>express-ejs-layouts</code>?</div>
    <div class="qa-body">
      <strong>Answer:</strong> In <code>server.js</code>, we configure:
      <div class="qa-code">app.use(expressLayouts);
app.set('layout', 'layouts/main');</div>
      The master template <code>views/layouts/main.ejs</code> defines the global HTML5 boilerplate, <code>&lt;head&gt;</code> meta tags, CSS stylesheets, top banner, global navbar, footer, and the Quick View <code>&lt;dialog&gt;</code> container. It contains a placeholder tag <code>&lt;%- body %&gt;</code>. When any controller executes <code>res.render('pages/shop', data)</code>, Express injects the parsed HTML of <code>shop.ejs</code> directly into the <code>&lt;%- body %&gt;</code> slot of <code>main.ejs</code>.
    </div>
  </div>

  <div class="page-break"></div>

  <!-- SECTION 2 -->
  <h2>Section 2: Database Design &amp; Mongoose Modeling</h2>

  <div class="qa-card highlight">
    <div class="qa-title"><span class="qa-num">Q4</span> When did you use embedded subdocuments versus relational references (<code>ObjectId</code>) in MongoDB?</div>
    <div class="qa-body">
      <strong>Answer:</strong>
      <ul>
        <li><strong>References (Normalized):</strong> We used <code>{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }</code> for <code>product.supplier</code> and <code>wishlist</code> items. Products and Users have independent lifecycles, and a supplier may own thousands of products. Referencing avoids document size bloat and keeps the 16MB BSON document limit intact.</li>
        <li><strong>Embedded Subdocuments (Denormalized):</strong> We embedded <code>specs: [{ key, value }]</code>, <code>features: [String]</code>, and <code>trackingEvents: [{ status, message, timestamp, location }]</code> directly within products and orders. Specifications and tracking events are always queried together with their parent document and have no independent existence outside it.</li>
        <li><strong>Hybrid Snapshot Pattern:</strong> In <code>Order.js</code>, we store a reference to <code>product</code>, but we also embed snapshots of <code>name</code>, <code>price</code>, and <code>thumbnail</code> at purchase time. This ensures that if a merchant updates a product's price from $100 to $150 next month, past historical orders remain accurate at $100.</li>
      </ul>
    </div>
  </div>

  <div class="qa-card">
    <div class="qa-title"><span class="qa-num">Q5</span> Explain how the Mongoose <code>pre('save')</code> hook works in <code>User.js</code>. What does <code>this.isModified('password')</code> prevent?</div>
    <div class="qa-body">
      <strong>Answer:</strong> In <code>src/models/User.js</code>:
      <div class="qa-code">userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});</div>
      <strong>Explanation:</strong> This is a document middleware hook that intercepts any save operation before it writes to MongoDB. 
      The guard <code>if (!this.isModified('password')) return next();</code> is critical: if a user updates their name or shipping address without changing their password, this hook will skip hashing. Without this check, the already-hashed bcrypt string (e.g. <code>$2a$10$...</code>) would be re-hashed, permanently corrupting the user's password and locking them out.
    </div>
  </div>

  <div class="qa-card">
    <div class="qa-title"><span class="qa-num">Q6</span> What is the purpose of the <code>slug</code> field in Product and Category schemas?</div>
    <div class="qa-body">
      <strong>Answer:</strong> Instead of exposing raw database IDs in URLs (e.g. <code>/product/6a98f587d605aafcd96bb0d2</code>), we generate URL-friendly slug strings (e.g. <code>/product/aura-studio-wireless-anc-headphones</code>).
      In Mongoose, <code>slug</code> is defined with <code>unique: true, lowercase: true, index: true</code>. This achieves three goals:
      <ol>
        <li><strong>SEO:</strong> Search engine crawlers prioritize human-readable keywords in the URL path.</li>
        <li><strong>Security:</strong> Prevents sequential ID enumeration attacks.</li>
        <li><strong>Query Performance:</strong> The unique index allows MongoDB to perform B-Tree lookups in <em>O(log N)</em> time rather than scanning all documents.</li>
      </ol>
    </div>
  </div>

  <div class="qa-card">
    <div class="qa-title"><span class="qa-num">Q7</span> How does Mongoose population (<code>.populate()</code>) work? Is it an SQL JOIN?</div>
    <div class="qa-body">
      <strong>Answer:</strong> No, MongoDB is a NoSQL document database and does not perform native relational SQL JOINs across separate tables. When we call:
      <div class="qa-code">const order = await Order.findById(id).populate('orderItems.product');</div>
      Mongoose executes an initial query to fetch the Order document, extracts all <code>product</code> ObjectIds, and then executes a second query (<code>Product.find({ _id: { $in: productIds } })</code>) under the hood. Mongoose then joins the returned product objects into the <code>orderItems.product</code> properties in memory before returning the document to the controller.
    </div>
  </div>

  <div class="page-break"></div>

  <!-- SECTION 3 -->
  <h2>Section 3: Authentication, Sessions &amp; Security</h2>

  <div class="qa-card highlight">
    <div class="qa-title"><span class="qa-num">Q8</span> Why did you use Session-based authentication with <code>connect-mongo</code> instead of stateless JSON Web Tokens (JWT)?</div>
    <div class="qa-body">
      <strong>Answer:</strong>
      <ol>
        <li><strong>Instant Revocation:</strong> With JWTs, once an access token is signed, it is valid until expiration unless a token blacklist is maintained in Redis. With session-based authentication in MongoDB, if an admin disables a compromised account, deleting the session record in MongoDB instantly revokes access on the next HTTP request.</li>
        <li><strong>Protection from XSS:</strong> Storing JWTs in browser <code>localStorage</code> exposes them to Cross-Site Scripting (XSS) theft. Express sessions use <code>httpOnly</code> cookies, which JavaScript running in the browser cannot read.</li>
        <li><strong>Cart Integration:</strong> Guest shopping carts and authenticated carts seamlessly bind to the same session identifier (<code>req.session.cart</code>).</li>
      </ol>
    </div>
  </div>

  <div class="qa-card">
    <div class="qa-title"><span class="qa-num">Q9</span> Explain the security flags configured on the session cookie in <code>server.js</code>.</div>
    <div class="qa-body">
      <strong>Answer:</strong>
      <div class="qa-code">cookie: {
  maxAge: 14 * 24 * 60 * 60 * 1000, // 14-day persistent login
  httpOnly: true,                    // Cannot be accessed via document.cookie
  sameSite: 'lax',                   // Prevents Cross-Site Request Forgery (CSRF)
  secure: process.env.NODE_ENV === 'production' // Transmitted over HTTPS only
}</div>
      <ul>
        <li><strong><code>httpOnly: true</code>:</strong> Prevents malicious third-party scripts from stealing the session cookie via <code>document.cookie</code>.</li>
        <li><strong><code>sameSite: 'lax'</code>:</strong> Ensures the browser only sends the cookie for same-site requests and top-level navigation, blocking cross-site CSRF attacks.</li>
        <li><strong><code>secure: true</code>:</strong> Instructs the browser to only transmit the cookie over encrypted HTTPS channels, preventing packet sniffing on public Wi-Fi.</li>
      </ul>
    </div>
  </div>

  <div class="qa-card highlight">
    <div class="qa-title"><span class="qa-num">Q10</span> Why is <code>app.set('trust proxy', 1)</code> mandatory on cloud hosts like Render.com?</div>
    <div class="qa-body">
      <strong>Answer:</strong> In modern cloud environments (Render, Heroku, AWS, Cloudflare), the public client connects to a reverse proxy over HTTPS. The reverse proxy terminates the TLS encryption and forwards the request to the internal Node.js container over plain HTTP, adding a header <code>X-Forwarded-Proto: https</code>.
      <br><br>
      By default, Express considers internal HTTP connections unencrypted. If <code>cookie.secure: true</code> is configured, Express refuses to set the cookie because it believes the connection is insecure. Enabling <code>app.set('trust proxy', 1)</code> instructs Express to trust the first proxy hop and inspect the <code>X-Forwarded-Proto</code> header. Without this line, session cookies fail completely in production, and users are logged out on every refresh.
    </div>
  </div>

  <div class="qa-card">
    <div class="qa-title"><span class="qa-num">Q11</span> How does Role-Based Access Control (RBAC) prevent unauthorized route access?</div>
    <div class="qa-body">
      <strong>Answer:</strong> In <code>src/middleware/auth.js</code>, we define gatekeepers:
      <ul>
        <li><code>ensureAuth</code>: Checks if <code>req.session.user</code> exists. If not, saves <code>req.originalUrl</code> to <code>req.session.returnTo</code> and redirects to login.</li>
        <li><code>ensureAdmin</code>: Checks <code>req.session.user.role === 'admin'</code>. Returns HTTP 403 Forbidden if violated.</li>
        <li><code>ensureSupplier</code>: Checks <code>req.session.user.role === 'supplier' || req.session.user.role === 'admin'</code>.</li>
      </ul>
      Crucially, in <code>src/routes/adminRoutes.js</code> and <code>supplierRoutes.js</code>, we scope these middlewares:
      <div class="qa-code">router.use('/admin', ensureAdmin);
router.use('/supplier', ensureSupplier);</div>
      This guarantees that no user can bypass authorization, while preventing route leakage.
    </div>
  </div>

  <div class="qa-card">
    <div class="qa-title"><span class="qa-num">Q12</span> How do you prevent horizontal privilege escalation between two competing suppliers?</div>
    <div class="qa-body">
      <strong>Answer:</strong> In <code>supplierController.js</code>, it is not enough to just check if the user is a supplier. We enforce <strong>database-level ownership scoping</strong>:
      <div class="qa-code">const filter = { _id: req.params.id };
if (req.session.user.role !== 'admin') {
  filter.supplier = req.session.user._id; // Restricts mutation to items owned by this supplier
}
const product = await Product.findOne(filter);
if (!product) return res.status(404).json({ success: false, message: 'Unauthorized or not found' });</div>
      If Supplier A sends an HTTP request targeting the product ID of Supplier B, the query returns <code>null</code> and the mutation is rejected.
    </div>
  </div>

  <div class="page-break"></div>

  <!-- SECTION 4 -->
  <h2>Section 4: Inventory Management &amp; Stock Adjustment Controls</h2>

  <div class="qa-card highlight">
    <div class="qa-title"><span class="qa-num">Q13</span> Walk me through the full lifecycle of a 1-click stock adjustment (e.g. clicking <code>+5</code>).</div>
    <div class="qa-body">
      <strong>Answer:</strong>
      <ol>
        <li><strong>Client Action:</strong> The user clicks <code>&lt;button class="btn-stock-adjust plus" data-action="add" data-amount="5"&gt;+5&lt;/button&gt;</code> in the inventory table.</li>
        <li><strong>Event Delegation (<code>main.js</code>):</strong> A delegated click listener intercepts the event, extracts <code>productId</code> and <code>data-endpoint</code>, gives button scale feedback, and fires an asynchronous <code>fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'add', amount: 5 }) })</code>.</li>
        <li><strong>Controller Execution (<code>supplierController.js</code> / <code>adminController.js</code>):</strong> The backend authenticates the session, verifies supplier ownership, increments the stock with <code>Math.max(0, product.stock + 5)</code>, saves the document to MongoDB, and returns:
        <div class="qa-code">{ success: true, productId: "...", newStock: 33, oldStock: 28, change: 5, message: "Added 5 units..." }</div></li>
        <li><strong>DOM Hydration:</strong> The client JavaScript updates <code>#input-stock-\${productId}.value = 33</code>, swaps the badge pill to <code>● In Stock (33)</code>, and triggers a toast notification without any full page reload.</li>
      </ol>
    </div>
  </div>

  <div class="qa-card">
    <div class="qa-title"><span class="qa-num">Q14</span> How does the stock adjustment endpoint support both AJAX and traditional HTML form POSTs?</div>
    <div class="qa-body">
      <strong>Answer:</strong> Through <strong>Content Negotiation</strong>:
      <div class="qa-code">if (req.xhr || req.headers.accept?.includes('application/json')) {
  return res.json({ success: true, newStock: product.stock, message: msg });
}
res.redirect('/supplier/products?success=' + encodeURIComponent(msg));</div>
      If the request originates from client-side <code>fetch()</code> with <code>Accept: application/json</code>, Express responds with JSON. If JavaScript is disabled or a standard HTML <code>&lt;form&gt;</code> submits the data, Express redirects back to the catalog with a flash query parameter.
    </div>
  </div>

  <div class="qa-card">
    <div class="qa-title"><span class="qa-num">Q15</span> How would you handle high-concurrency race conditions (e.g. two shoppers purchasing the last unit simultaneously)?</div>
    <div class="qa-body">
      <strong>Answer:</strong> In MongoDB, reading a stock value into memory, decrementing in JavaScript, and calling <code>save()</code> can lead to race conditions if two threads execute in parallel.
      In high-concurrency production, we use <strong>atomic database operations</strong>:
      <div class="qa-code">const updatedProduct = await Product.findOneAndUpdate(
  { _id: productId, stock: { $gte: quantity } }, // Atomic condition check
  { $inc: { stock: -quantity } },                 // Atomic decrement
  { new: true }
);
if (!updatedProduct) throw new Error('Insufficient stock or sold out');</div>
      Because MongoDB executes single-document operations atomically, only the first request decrements the stock; the second request fails the <code>$gte</code> condition, completely preventing overselling.
    </div>
  </div>

  <!-- SECTION 5 -->
  <h2>Section 5: Frontend Interactivity &amp; Client-Side JavaScript</h2>

  <div class="qa-card highlight">
    <div class="qa-title"><span class="qa-num">Q16</span> How does the Product Quick View feature work without reloading the page?</div>
    <div class="qa-body">
      <strong>Answer:</strong>
      <ol>
        <li>In <code>views/layouts/main.ejs</code>, we define a native HTML5 dialog: <code>&lt;dialog id="quickViewModal" class="quick-view-modal"&gt;</code>.</li>
        <li>When the user clicks the floating "Quick View" button on any product card, <code>initQuickViewModal()</code> in <code>main.js</code> calls <code>modal.showModal()</code> to render a centered modal with an automatic backdrop blur.</li>
        <li>It issues an HTTP GET request to <code>/api/products/\${productId}/quickview</code>.</li>
        <li>The controller responds with a compact JSON document containing all image angles, specifications, features, verified supplier name, and stock count.</li>
        <li>Client JavaScript dynamically populates the dialog DOM with an interactive image gallery, quantity stepper, and an AJAX "Add to Cart" button.</li>
      </ol>
    </div>
  </div>

  <div class="qa-card">
    <div class="qa-title"><span class="qa-num">Q17</span> What is "Debouncing" and why is it used in the live search bar?</div>
    <div class="qa-body">
      <strong>Answer:</strong> Debouncing is a rate-limiting technique that delays executing a function until a certain amount of time has elapsed since the last time the event was triggered.
      <div class="qa-code">let debounceTimer;
searchInput.addEventListener('input', (e) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(async () => {
    const res = await fetch('/api/search?q=' + encodeURIComponent(query));
    // render dropdown
  }, 250);
});</div>
      Without debouncing, if a user types "Headphones" (10 keystrokes), the browser would dispatch 10 separate HTTP requests to MongoDB within milliseconds, causing server CPU spikes. With a 250ms debounce, <code>clearTimeout</code> cancels previous timers on every keystroke, sending only 1 request when the user pauses typing.
    </div>
  </div>

  <div class="page-break"></div>

  <!-- SECTION 6 -->
  <h2>Section 6: Cart, Pricing &amp; Promotions Engine</h2>

  <div class="qa-card">
    <div class="qa-title"><span class="qa-num">Q18</span> How does the shopping cart state work across requests?</div>
    <div class="qa-body">
      <strong>Answer:</strong> The shopping cart is maintained in the user's session: <code>req.session.cart = { items: [], totalQty, subtotal, discount, shipping, total, coupon }</code>.
      Because Express Session is backed by <code>connect-mongo</code>, this cart is persisted in the <code>sessions</code> collection in MongoDB Atlas. If the user refreshes the page, switches browser tabs, or signs in, their cart items are preserved. Once the user completes checkout, the session cart is converted into a permanent <code>Order</code> document, and <code>req.session.cart.items</code> is cleared.
    </div>
  </div>

  <div class="qa-card highlight">
    <div class="qa-title"><span class="qa-num">Q19</span> How does the coupon calculation engine work for <code>SAVE20</code>?</div>
    <div class="qa-body">
      <strong>Answer:</strong> In <code>cartController.js</code>, when a user submits coupon code <code>SAVE20</code>:
      <div class="qa-code">const VALID_COUPONS = {
  SAVE20: { code: 'SAVE20', discount: 20, type: 'percentage' },
  WELCOME10: { code: 'WELCOME10', discount: 10, type: 'fixed' }
};</div>
      The code is validated and stored in <code>req.session.cart.coupon</code>. Then, the global <code>initCartAndLocals</code> middleware recalculates totals on every request:
      <ul>
        <li><code>subtotal = sum(price * quantity)</code></li>
        <li><code>discount = (subtotal * 20) / 100</code></li>
        <li><code>shipping = (subtotal > 50) ? 0 : 9.99</code> (Free shipping threshold)</li>
        <li><code>total = subtotal - discount + shipping</code></li>
      </ul>
    </div>
  </div>

  <!-- SECTION 7 -->
  <h2>Section 7: Express Middleware &amp; Error Pipeline</h2>

  <div class="qa-card">
    <div class="qa-title"><span class="qa-num">Q20</span> How does Express recognize Error-Handling middleware? Why does it require 4 arguments?</div>
    <div class="qa-body">
      <strong>Answer:</strong> In <code>src/middleware/errorHandler.js</code>:
      <div class="qa-code">const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).render('pages/error', { message: err.message });
};</div>
      Express inspects function parameter length (<code>fn.length</code>). Standard middleware has 3 arguments: <code>(req, res, next)</code>. When Express sees <strong>exactly 4 arguments</strong> <code>(err, req, res, next)</code>, it registers the function in its internal error pipeline. If any upstream controller calls <code>next(error)</code> or throws an error, Express bypasses all remaining standard routes and jumps directly to this 4-argument error handler.
    </div>
  </div>

  <div class="qa-card">
    <div class="qa-title"><span class="qa-num">Q21</span> What was the route collision bug between Admin and Supplier routes and how was it solved?</div>
    <div class="qa-body">
      <strong>Answer:</strong>
      Originally, <code>adminRoutes.js</code> used an unscoped <code>router.use(ensureAdmin)</code>. When mounted in <code>server.js</code> with <code>app.use('/', adminRoutes)</code>, that middleware intercepted <em>every single URL path</em> on the server. When a supplier visited <code>/supplier</code>, <code>ensureAdmin</code> checked if their role was <code>admin</code>, saw it was <code>supplier</code>, and returned 403 Forbidden before the request could ever reach <code>supplierRoutes</code>!
      <br><br>
      <strong>The Fix:</strong> We scoped the middleware to its respective path prefix:
      <div class="qa-code">// In adminRoutes.js:
router.use('/admin', ensureAdmin);

// In supplierRoutes.js:
router.use('/supplier', ensureSupplier);</div>
      Now, requests to <code>/supplier/*</code> bypass admin middleware completely.
    </div>
  </div>

  <!-- SECTION 8 -->
  <h2>Section 8: DevOps, Cloud Hosting &amp; Production Operations</h2>

  <div class="qa-card highlight">
    <div class="qa-title"><span class="qa-num">Q22</span> Explain the cloud deployment architecture on Render.com and MongoDB Atlas.</div>
    <div class="qa-body">
      <strong>Answer:</strong>
      <ol>
        <li><strong>Continuous Deployment (CD):</strong> Pushing code to the <code>main</code> branch on GitHub triggers an automated webhook to Render.com.</li>
        <li><strong>Build Phase:</strong> Render reads <code>render.yaml</code>, checks the Node.js engine (<code>>=18.0.0</code> in <code>package.json</code>), installs production dependencies with <code>npm install</code>, and executes <code>npm start</code>.</li>
        <li><strong>Health Check Validation:</strong> Render sends periodic HTTP GET requests to <code>/health</code>. Once our server responds with HTTP 200 <code>{ status: 'ok' }</code>, Render's load balancer redirects public domain traffic to the new container and shuts down the old container with zero downtime.</li>
        <li><strong>Database Layer:</strong> The application connects over an encrypted TLS connection (<code>mongodb+srv://...</code>) to a MongoDB Atlas M0 cluster with IP whitelist <code>0.0.0.0/0</code>.</li>
      </ol>
    </div>
  </div>

  <div class="qa-card">
    <div class="qa-title"><span class="qa-num">Q23</span> Why was database seeding (<code>npm run seed</code>) necessary after initial deployment?</div>
    <div class="qa-body">
      <strong>Answer:</strong> When deploying to a brand-new MongoDB Atlas cluster, the database contains zero collections. Without seeding, the homepage would show 0 categories and 0 products, and no admin/supplier accounts would exist to log in.
      Running <code>npm run seed</code> executes <code>src/seeds/seed.js</code>, which uses Mongoose models to programmatically insert 8 rich categories, 16 multi-image products, initial stock levels, and pre-hashed user credentials (<code>admin@store.com</code>, <code>supplier@apex.com</code>, <code>john@example.com</code>).
    </div>
  </div>

  <div class="callout" style="border-left-color: #4f46e5; background: #eef2ff; margin-top: 15px;">
    <div class="callout-title">Summary of Key Concepts to Mention in Viva</div>
    <p>Always highlight: <strong>MVC Separation of Concerns</strong>, <strong>Bcrypt Pre-save Hook</strong>, <strong>Session Security (httpOnly, sameSite, trust proxy)</strong>, <strong>1-Click AJAX Stock Stepper</strong>, <strong>HTML5 &lt;dialog&gt; Quick View</strong>, and <strong>Zero-Downtime Render.com Cloud Deployment</strong>.</p>
  </div>

</body>
</html>`;

const htmlFilePath = path.join('/tmp', 'shopease_viva_interview_guide.html');
const pdfFilePath = path.join(OUTPUT_DIR, 'Shopease_Viva_Interview_Questions_and_Answers.pdf');

fs.writeFileSync(htmlFilePath, htmlContent, 'utf8');
console.log('HTML written to:', htmlFilePath);

const cmd = `"${CHROME_PATH}" --headless --disable-gpu --print-to-pdf="${pdfFilePath}" --no-pdf-header-footer "${htmlFilePath}"`;
console.log('Executing Chrome PDF conversion for Viva Guide...');
execSync(cmd, { stdio: 'inherit' });
console.log('PDF 2 created successfully:', pdfFilePath);
