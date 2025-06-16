// Test Email Automation System
// Run with: node test-email-automation.js

const http = require('http');
const https = require('https');

// Configuration
const BASE_URL = 'https://nuvante.in'; // Change to your domain when deployed
const TEST_EMAIL = 'ameykurade60@gmail.com'; // Change to your test email
const ADMIN_EMAIL = 'support@nuvante.in'; // Change to your admin email

// Helper function to make HTTP requests
function makeRequest(url, method = 'GET', data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const lib = isHttps ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = lib.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({ status: res.statusCode, data: jsonBody, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: body, headers: res.headers });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Test functions
async function testWebhookInfo() {
  console.log('\n🔍 Testing Webhook Info (GET)...');
  try {
    const response = await makeRequest(`${BASE_URL}/api/webhooks/order-success`);
    console.log('✅ Status:', response.status);
    console.log('📄 Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

async function testOrderSuccessWebhook() {
  console.log('\n📧 Testing Order Success Webhook...');
  
  const orderData = {
    success: true,
    orderId: `TEST-${Date.now()}`,
    customerEmail: TEST_EMAIL,
    customerName: 'Test Customer',
    orderTotal: '$99.99',
    orderItems: [
      { name: 'Test Product A', quantity: 2, price: '$49.99' },
      { name: 'Test Product B', quantity: 1, price: '$50.00' }
    ],
    shippingAddress: '123 Test Street, Test City, TS 12345',
    paymentMethod: 'Credit Card',
    userId: 'test_user_123'
  };

  try {
    const response = await makeRequest(
      `${BASE_URL}/api/webhooks/order-success`,
      'POST',
      orderData
    );
    console.log('✅ Status:', response.status);
    console.log('📄 Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

async function testFailedOrderWebhook() {
  console.log('\n❌ Testing Failed Order (should not send email)...');
  
  const failedOrderData = {
    success: false, // This should prevent email sending
    orderId: `FAILED-${Date.now()}`,
    customerEmail: TEST_EMAIL,
    customerName: 'Test Customer'
  };

  try {
    const response = await makeRequest(
      `${BASE_URL}/api/webhooks/order-success`,
      'POST',
      failedOrderData
    );
    console.log('✅ Status:', response.status);
    console.log('📄 Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

async function testEmailConfiguration() {
  console.log('\n⚙️ Testing Email Configuration...');
  try {
    const response = await makeRequest(
      `${BASE_URL}/api/admin/test-email`,
      'GET',
      null,
      { 'x-user-email': ADMIN_EMAIL }
    );
    console.log('✅ Status:', response.status);
    console.log('📄 Configuration:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

async function testEmailConnection() {
  console.log('\n🔌 Testing Email Connection...');
  try {
    const response = await makeRequest(
      `${BASE_URL}/api/admin/test-email`,
      'POST',
      { testType: 'connection' },
      { 'x-user-email': ADMIN_EMAIL }
    );
    console.log('✅ Status:', response.status);
    console.log('📄 Connection Test:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

async function testSendTestEmail() {
  console.log('\n📬 Testing Send Test Email...');
  try {
    const response = await makeRequest(
      `${BASE_URL}/api/admin/test-email`,
      'POST',
      { 
        testType: 'send',
        testEmail: TEST_EMAIL 
      },
      { 'x-user-email': ADMIN_EMAIL }
    );
    console.log('✅ Status:', response.status);
    console.log('📄 Send Test:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

async function testEmailTemplates() {
  console.log('\n📝 Testing Email Templates...');
  try {
    const response = await makeRequest(
      `${BASE_URL}/api/admin/email-templates`,
      'GET',
      null,
      { 'x-user-email': ADMIN_EMAIL }
    );
    console.log('✅ Status:', response.status);
    console.log('📄 Templates Count:', response.data.count || 0);
    if (response.data.templates && response.data.templates.length > 0) {
      console.log('📄 Template Names:', response.data.templates.map(t => t.name));
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

async function seedDefaultTemplates() {
  console.log('\n🌱 Seeding Default Templates...');
  try {
    const response = await makeRequest(
      `${BASE_URL}/api/admin/seed-templates`,
      'POST',
      {},
      { 'x-user-email': ADMIN_EMAIL }
    );
    console.log('✅ Status:', response.status);
    console.log('📄 Seed Result:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Email Automation Tests...');
  console.log('📍 Base URL:', BASE_URL);
  console.log('📧 Test Email:', TEST_EMAIL);
  console.log('👤 Admin Email:', ADMIN_EMAIL);
  console.log('=' * 50);

  // Basic tests (no auth required)
  await testWebhookInfo();
  await testOrderSuccessWebhook();
  await testFailedOrderWebhook();

  // Admin tests (requires admin email)
  await testEmailConfiguration();
  await testEmailConnection();
  await testEmailTemplates();
  await seedDefaultTemplates();
  await testSendTestEmail();

  console.log('\n🏁 All tests completed!');
  console.log('\n💡 Tips:');
  console.log('   - Update BASE_URL for production testing');
  console.log('   - Change TEST_EMAIL to your email address');
  console.log('   - Make sure ADMIN_EMAIL is in your AdminEmail collection');
  console.log('   - Check your SMTP credentials in .env.local');
  console.log('   - View logs at /admin/email-automation');
}

// Handle different test modes
const args = process.argv.slice(2);
const testMode = args[0];

if (testMode === 'webhook') {
  console.log('🎯 Testing Webhook Only...');
  testWebhookInfo().then(() => testOrderSuccessWebhook());
} else if (testMode === 'config') {
  console.log('⚙️ Testing Configuration Only...');
  testEmailConfiguration().then(() => testEmailConnection());
} else if (testMode === 'send') {
  console.log('📧 Testing Email Send Only...');
  testSendTestEmail();
} else if (testMode === 'seed') {
  console.log('🌱 Seeding Templates Only...');
  seedDefaultTemplates();
} else {
  // Run all tests
  runAllTests();
}

// Error handling
process.on('unhandledRejection', (reason, promise) => {
  console.log('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.log('❌ Uncaught Exception:', error);
  process.exit(1);
}); 