# Nuvante Email Automation - Production Setup

## 🚀 Single N8N Workflow for Complete Email Automation

This is your **ONE AND ONLY** file needed for complete email automation from frontend order success to beautiful customer & admin emails.

## 📁 Files You Need

1. **`IMPORT_TO_N8N.json`** - The complete workflow (import this to N8N)
2. **`nuvante-email-automation.env`** - Environment variables

## 🔧 Setup Instructions

### Step 1: Environment Variables

Create these environment variables in your N8N instance:

```bash
# SMTP Configuration
SMTP_FROM_EMAIL=support@nuvante.in
SUPPORT_EMAIL=support@nuvante.in
ADMIN_EMAIL=admin@nuvante.in,orders@nuvante.in
WEBSITE_URL=https://nuvante.vercel.app

# SMTP Credentials (Configure in N8N Credentials)  
SMTP_HOST=smtpout.secureserver.net
SMTP_PORT=587
SMTP_USER=support@nuvante.in
SMTP_PASS=your-godaddy-email-password
```

### Step 2: Import Workflow

1. Open your N8N instance
2. Go to **Workflows** → **Import from File**
3. Upload `IMPORT_TO_N8N.json`
4. Activate the workflow

### Step 3: Configure SMTP Credentials

1. Go to **Credentials** in N8N
2. Create new **SMTP** credential with ID: `nuvante-smtp`
3. Fill in your GoDaddy SMTP details:
   - **Host**: smtpout.secureserver.net
   - **Port**: 587
   - **Security**: STARTTLS (if available) or None
   - **Username**: support@nuvante.in (your full GoDaddy email)
   - **Password**: your-godaddy-email-password

### Step 4: Get Webhook URL

After importing, you'll get a webhook URL like:
```
https://your-n8n-instance.com/webhook/nuvante-order-success
```

## 📤 Frontend Integration

Send a POST request to your webhook URL with this structure:

```javascript
// Minimum required fields
const orderData = {
  success: true,                    // REQUIRED
  orderId: "ORDER_123456789",       // REQUIRED
  customerEmail: "customer@email.com", // REQUIRED (or use alternatives below)
  
  // Alternative email fields (workflow will auto-detect):
  // email: "customer@email.com",
  // shippingAddress: { email: "customer@email.com" },
  // user: { email: "customer@email.com" },
  
  // Optional but recommended fields:
  amount: 2500,
  customerName: "John",
  lastName: "Doe",
  phone: "+91-9876543210",
  paymentId: "PAY_987654321",
  
  // Items array (flexible structure):
  items: [
    {
      name: "Product Name",          // or productId, product, title
      size: "L",                     // or variant
      quantity: 2,                   // or qty
      price: 1250                    // or amount
    }
  ],
  
  // Shipping address (flexible structure):
  shippingAddress: {
    firstName: "John",
    lastName: "Doe",
    streetAddress: "123 Main Street", // or address, line1
    apartment: "Apt 4B",              // or line2
    city: "Mumbai",
    pin: "400001",                    // or pincode, postalCode
    phone: "+91-9876543210"
  },
  
  // Optional discount fields:
  couponCode: "DISCOUNT10",         // or appliedCoupon, discountCode
  discount: 250,                    // or couponDiscount, discountAmount
  
  // Optional date fields:
  timestamp: "2024-12-19T15:30:00Z", // or createdAt, orderDate, date
  estimatedDelivery: "2024-12-25T00:00:00Z" // or deliveryDate, expectedDelivery
};

// Send to webhook
fetch('https://your-n8n-instance.com/webhook/nuvante-order-success', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(orderData)
});
```

## ✅ What This Workflow Does

1. **Receives** order data from your frontend
2. **Validates** required fields (success, orderId, customerEmail)
3. **Processes** data flexibly (works with various data structures)
4. **Sends** beautiful customer confirmation email
5. **Sends** detailed admin notification email
6. **Logs** email activity for tracking
7. **Returns** success response with details

## 🔄 Flexible Data Handling

The workflow automatically extracts data from multiple possible field names:

- **Customer Email**: `customerEmail`, `email`, `shippingAddress.email`, `user.email`
- **Customer Name**: `customerName + lastName`, `firstName + lastName`, `shippingAddress.firstName + lastName`, `user.firstName + lastName`
- **Phone**: `phone`, `shippingAddress.phone`, `user.phone`
- **Items**: `items`, `itemDetails`, `products`
- **Payment ID**: `paymentId`, `razorpayPaymentId`, `transactionId`, `payment.id`
- **Amount**: `amount`, `total`, `totalAmount`

## 📧 Email Features

### Customer Email:
- Beautiful HTML design with Nuvante branding
- Order summary with all details
- Items table with products, sizes, quantities, prices
- Shipping address formatting
- Discount/coupon information (if applicable)
- Next steps and support information

### Admin Email:
- Clean, professional design
- Order value prominently displayed
- Complete customer information
- Items list
- Shipping address
- Immediate action alerts
- Timestamp in IST

## 🔍 Email Activity Logging

The workflow logs every email sent:

```json
{
  "orderId": "ORDER_123456789",
  "customerEmail": "customer@email.com",
  "customerName": "John Doe",
  "orderAmount": "₹2,500",
  "timestamp": "2024-12-19T15:30:00.000Z",
  "emailsSent": {
    "customer": true,
    "admin": true
  },
  "status": "completed"
}
```

## 🚨 Error Handling

If validation fails, returns detailed error:

```json
{
  "success": false,
  "error": "Order validation failed",
  "message": "Invalid order data. Please ensure success=true, orderId exists, and customer email is provided.",
  "requiredFields": {
    "success": "Must be true",
    "orderId": "Must not be empty",  
    "customerEmail": "Must provide customerEmail, email, shippingAddress.email, or user.email"
  },
  "timestamp": "2024-12-19T15:30:00.000Z"
}
```

## 🎯 Success Response

On successful completion:

```json
{
  "success": true,
  "message": "Order email automation completed successfully!",
  "orderId": "ORDER_123456789",
  "customerEmail": "customer@email.com",
  "customerName": "John Doe",
  "orderAmount": "₹2,500",
  "emailsSent": {
    "customer": true,
    "admin": true
  },
  "timestamp": "2024-12-19T15:30:00.000Z",
  "webhookUrl": "POST /webhook/nuvante-order-success"
}
```

## 🔧 Production Recommendations

1. **Test thoroughly** with sample data before going live
2. **Monitor logs** for any email delivery issues
3. **Set up email delivery monitoring** (check spam folders)
4. **Use environment variables** for all configurable values
5. **Keep webhook URL secure** (don't expose publicly)

## 📞 Support

This workflow is production-ready and handles:
- ✅ Multiple users/orders
- ✅ Flexible data structures  
- ✅ Beautiful email templates
- ✅ Comprehensive logging
- ✅ Error handling
- ✅ No authentication required
- ✅ Email activity tracking

Your single file solution for complete email automation! 🚀 