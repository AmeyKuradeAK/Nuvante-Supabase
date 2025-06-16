// Test Nuvante Production Webhook with Real Order Data
// Run with: node test-webhook-nuvante.js

const https = require('https');

// Sample order data based on your order structure
const sampleOrderData = {
  success: true,
  orderId: 'TEST-' + Date.now(),
  customerEmail: 'ameykurade60@gmail.com',
  customerName: 'Amey Kurade',
  orderTotal: '₹1,299',
  paymentMethod: 'Credit Card',
  itemDetails: [
    {
      productId: '6747b41b54a66cd3a94ea8dc', // Real product ID from your system
      size: 'M',
      quantity: 2
    },
    {
      productId: '6747b41b54a66cd3a94ea8dd', // Another product ID
      size: 'L', 
      quantity: 1
    }
  ],
  shippingAddress: {
    firstName: 'Amey',
    lastName: 'Kurade',
    streetAddress: '123 Test Street',
    apartment: 'Apt 1A',
    city: 'Mumbai',
    pin: '400001',
    phone: '+91 9876543210'
  },
  userId: 'test_user_123'
};

console.log('🚀 Testing Nuvante Production Webhook...');
console.log('📧 Sample Order Data:', JSON.stringify(sampleOrderData, null, 2));

// Test webhook
const postData = JSON.stringify(sampleOrderData);

const options = {
  hostname: 'nuvante.in',
  port: 443,
  path: '/api/webhooks/order-success',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': postData.length
  }
};

const req = https.request(options, (res) => {
  console.log(`\n📍 Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      console.log('📄 Response:', JSON.stringify(result, null, 2));
      
      if (result.success) {
        console.log('\n✅ Webhook Test Successful!');
        console.log(`📧 Email Sent: ${result.emailSent}`);
        console.log(`🎯 Order Details: ${result.orderDetails?.itemsCount || 0} items`);
        console.log(`🛍️ Products Found: ${result.orderDetails?.productsFound || 0}`);
        
        if (result.emailError) {
          console.log(`⚠️  Email Error: ${result.emailError}`);
        }
      } else {
        console.log('\n❌ Webhook Test Failed');
        console.log(`Error: ${result.error || result.message}`);
      }
    } catch (e) {
      console.log('Raw Response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Request Error:', e.message);
});

req.write(postData);
req.end(); 