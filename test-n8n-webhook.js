// N8N Webhook Tester
// Run with: node test-n8n-webhook.js

const https = require('https');

// Test data - modify as needed
const testOrderData = {
  success: true,
  orderId: "TEST_ORDER_123",
  customerEmail: "ameykurade60@gmail.com",
  customerName: "Amey",
  lastName: "Kurade",
  phone: "+91-9876543210",
  amount: 2500,
  paymentId: "PAY_TEST_123",
  items: [
    {
      name: "Test T-Shirt",
      size: "L",
      quantity: 2,
      price: 1250
    },
    {
      name: "Test Hoodie", 
      size: "M",
      quantity: 1,
      price: 1250
    }
  ],
  shippingAddress: {
    firstName: "Amey",
    lastName: "Kurade",
    email: "ameykurade60@gmail.com",
    phone: "+91-9876543210",
    streetAddress: "123 Test Street",
    apartment: "Apt 4B",
    city: "Mumbai",
    pin: "400001"
  },
  couponCode: "TEST10",
  discount: 250,
  timestamp: new Date().toISOString()
};

// N8N Webhook URL
const webhookUrl = 'https://nuvante-email-n8n.onrender.com/webhook/nuvante-order-success';

console.log('🚀 Testing N8N Email Automation Webhook...\n');
console.log('📤 Sending test order data to:', webhookUrl);
console.log('📋 Test data:', JSON.stringify(testOrderData, null, 2));
console.log('\n⏳ Sending request...\n');

// Send POST request
const postData = JSON.stringify(testOrderData);

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = https.request(webhookUrl, options, (res) => {
  console.log(`📡 Response Status: ${res.statusCode}`);
  console.log(`📋 Response Headers:`, res.headers);
  
  let responseData = '';
  
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    console.log('\n📥 Response Body:');
    try {
      const jsonResponse = JSON.parse(responseData);
      console.log(JSON.stringify(jsonResponse, null, 2));
      
      if (jsonResponse.success) {
        console.log('\n✅ SUCCESS! Email automation completed successfully!');
        console.log(`📧 Emails sent to: ${jsonResponse.customerEmail}`);
        console.log(`💰 Order amount: ${jsonResponse.orderAmount}`);
      } else {
        console.log('\n❌ FAILED! Email automation failed.');
        console.log(`🚨 Error: ${jsonResponse.error}`);
        console.log(`💡 Message: ${jsonResponse.message}`);
      }
    } catch (e) {
      console.log('📄 Raw response:', responseData);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Request failed:', e.message);
  
  if (e.code === 'ENOTFOUND') {
    console.log('🌐 Check if N8N URL is correct and accessible');
  } else if (e.code === 'ECONNREFUSED') {
    console.log('🔗 N8N service might be down or sleeping');
  }
});

// Send the data
req.write(postData);
req.end();

// Test different scenarios
console.log('\n📝 To test different scenarios, modify the testOrderData object above and run again.');
console.log('💡 Common test cases:');
console.log('   - Missing required fields (set success: false)');
console.log('   - Different email formats');
console.log('   - Various item structures');
console.log('   - Different shipping address formats'); 