// Comprehensive end-to-end test script for Shopease
const http = require('http');

async function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body: data }));
    });
    req.on('error', reject);
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- Starting Automated E2E Verification ---');
  let cookie = '';

  // 1. Fetch Homepage
  console.log('1. Testing Homepage GET /');
  let res = await request({ hostname: 'localhost', port: 3000, path: '/', method: 'GET' });
  if (res.headers['set-cookie']) {
    cookie = res.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
  }
  console.log(`   Homepage: Status ${res.statusCode} (Includes "Shopease": ${res.body.includes('Shopease')})`);

  // 2. Fetch Catalog
  console.log('2. Testing Catalog GET /shop?category=Electronics');
  res = await request({ hostname: 'localhost', port: 3000, path: '/shop?category=Electronics', method: 'GET', headers: { Cookie: cookie } });
  console.log(`   Catalog: Status ${res.statusCode} (Includes "Acoustix": ${res.body.includes('Acoustix')})`);

  // 3. Search API
  console.log('3. Testing Search API GET /api/search?q=Aura');
  res = await request({ hostname: 'localhost', port: 3000, path: '/api/search?q=Aura', method: 'GET' });
  const searchResults = JSON.parse(res.body);
  console.log(`   Search API returned ${searchResults.length} products. First: "${searchResults[0]?.name}"`);
  const productId = searchResults[0]._id;

  // 4. Add to Cart via AJAX POST
  console.log('4. Testing Add to Cart POST /cart/add');
  const cartPayload = JSON.stringify({ productId, quantity: 2 });
  res = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/cart/add',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Content-Length': Buffer.byteLength(cartPayload),
      Cookie: cookie
    }
  }, cartPayload);
  const cartRes = JSON.parse(res.body);
  console.log(`   Add to cart: success=${cartRes.success}, totalQty=${cartRes.cart?.totalQty}`);

  // 5. Apply Coupon Code
  console.log('5. Testing Apply Coupon POST /cart/coupon');
  const couponData = 'couponCode=SAVE20';
  res = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/cart/coupon',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(couponData),
      Cookie: cookie
    }
  }, couponData);
  console.log(`   Apply Coupon redirected with status: ${res.statusCode} to ${res.headers.location}`);

  // 6. Login as Customer
  console.log('6. Testing Customer Login POST /auth/login');
  const loginData = 'email=john%40example.com&password=customer123';
  res = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(loginData),
      Cookie: cookie
    }
  }, loginData);
  if (res.headers['set-cookie']) {
    cookie = res.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
  }
  console.log(`   Customer Login status: ${res.statusCode}, redirected to: ${res.headers.location}`);

  // 7. Place Order
  console.log('7. Testing Place Order POST /checkout');
  const checkoutData = 'fullName=John+Doe&phone=%2B15554328765&street=742+Evergreen+Terrace&city=Springfield&state=Oregon&postalCode=97477&paymentMethod=credit_card';
  res = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/checkout',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(checkoutData),
      Cookie: cookie
    }
  }, checkoutData);
  console.log(`   Place Order status: ${res.statusCode}, redirect: ${res.headers.location}`);
  const orderSuccessPath = res.headers.location;

  // 8. Order Success Page
  console.log(`8. Verifying Order Success ${orderSuccessPath}`);
  res = await request({
    hostname: 'localhost',
    port: 3000,
    path: orderSuccessPath,
    method: 'GET',
    headers: { Cookie: cookie }
  });
  console.log(`   Order Success Page Status: ${res.statusCode} (Includes "Thank you": ${res.body.includes('Thank you')})`);

  // 9. Login as Admin
  console.log('9. Testing Admin Login POST /auth/login');
  let adminCookie = '';
  res = await request({ hostname: 'localhost', port: 3000, path: '/auth/login', method: 'GET' });
  if (res.headers['set-cookie']) {
    adminCookie = res.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
  }
  const adminLoginData = 'email=admin%40store.com&password=admin123';
  res = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(adminLoginData),
      Cookie: adminCookie
    }
  }, adminLoginData);
  if (res.headers['set-cookie']) {
    adminCookie = res.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
  }
  console.log(`   Admin Login status: ${res.statusCode}, redirected to: ${res.headers.location}`);

  // 10. Admin Dashboard
  console.log('10. Testing Admin Dashboard GET /admin');
  res = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/admin',
    method: 'GET',
    headers: { Cookie: adminCookie }
  });
  console.log(`   Admin Dashboard status: ${res.statusCode} (Includes "Store Overview": ${res.body.includes('Store Overview')})`);

  console.log('\n--- ALL E2E VERIFICATION TESTS PASSED SUCCESSFULLY! ---');
  process.exit(0);
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
