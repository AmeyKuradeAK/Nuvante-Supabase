# Nuvante Order Email Automation Setup Guide

## 📧 Complete N8N Email Automation for Order Success

This guide will help you set up automated email notifications for every successful order using n8n, sending emails from `support@nuvante.in`.

## 🛠️ Prerequisites

1. **N8N Instance**: Self-hosted or cloud n8n instance
2. **SMTP Access**: For `support@nuvante.in` email
3. **Environment Variables**: Access to your Nuvante backend

## 📋 Step-by-Step Setup

### Step 1: N8N Setup

1. **Install/Access N8N**
   ```bash
   # Self-hosted option
   npm install n8n -g
   n8n start
   
   # Or use N8N Cloud: https://app.n8n.cloud/
   ```

2. **Import the Workflow**
   - Download the `nuvante-order-automation.json` file
   - In N8N, go to **Workflows** → **Import from File**
   - Select the JSON file
   
### Step 2: Configure SMTP Credentials

1. **Create SMTP Credential in N8N**
   - Go to **Credentials** → **Create New**
   - Choose **SMTP**
   - Name: `nuvante-smtp`
   
   **Gmail Setup (for support@nuvante.in):**
   ```
   Host: smtp.gmail.com
   Port: 587
   Security: STARTTLS
   Username: support@nuvante.in
   Password: [App Password - see below]
   ```

2. **Generate Gmail App Password**
   - Go to Google Account Settings
   - Security → 2-Step Verification
   - App Passwords → Generate password for "Mail"
   - Use this password in N8N SMTP config

### Step 3: Configure Webhook URL

1. **Get Your N8N Webhook URL**
   - In your imported workflow, click on "Order Success Webhook" node
   - Copy the **Production URL** (looks like: `https://your-n8n.com/webhook/nuvante-order-webhook`)

2. **Add Environment Variable**
   Add to your `.env.local` or deployment environment:
   ```env
   N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/nuvante-order-webhook
   ```

### Step 4: Email Template Customization

The workflow includes professional email templates for:

**Customer Email Features:**
- ✅ Order confirmation with details
- 📦 Beautiful HTML design matching Nuvante branding
- 📋 Complete order summary with items
- 🏠 Shipping address confirmation
- 🎟️ Coupon information (if applied)
- 🔗 Track order button

**Admin Email Features:**
- 🔔 Instant order notifications
- 📊 Complete order details
- 👤 Customer information
- 📦 Items breakdown
- 🏠 Shipping details
- 🎯 Direct link to admin panel

### Step 5: Test the Setup

1. **Test the Webhook**
   ```bash
   curl -X POST https://your-n8n-instance.com/webhook/nuvante-order-webhook \
   -H "Content-Type: application/json" \
   -d '{
     "success": true,
     "orderId": "test_123",
     "paymentId": "pay_test_123",
     "amount": 999,
     "currency": "INR",
     "timestamp": "2024-12-19T10:00:00.000Z",
     "estimatedDeliveryDate": "2024-12-24T10:00:00.000Z",
     "itemDetails": [
       {
         "productId": "test-product",
         "size": "M",
         "quantity": 1
       }
     ],
     "shippingAddress": {
       "firstName": "Test",
       "lastName": "Customer",
       "email": "test@example.com",
       "streetAddress": "123 Test St",
       "city": "Test City",
       "pin": "123456",
       "phone": "9876543210"
     }
   }'
   ```

2. **Place Test Order**
   - Go through your checkout process
   - Complete a real order
   - Check if emails are received

## 🔧 Advanced Configuration

### Multiple Admin Recipients

Edit the "Send Admin Notification" node:
```
To Email: admin@nuvante.in,orders@nuvante.in,owner@nuvante.in
```

### Custom Email Templates

The workflow includes variables you can customize:
- `{{ $json.orderData.orderId }}` - Order ID
- `{{ $json.orderData.amount }}` - Order amount
- `{{ $json.itemsHtml }}` - Items table HTML
- `{{ $json.couponHtml }}` - Coupon details HTML

### Environment-specific URLs

Update these in the workflow nodes:
- Production: `https://nuvante.vercel.app`
- Staging: `https://staging-nuvante.vercel.app`

## 🛡️ Security & Best Practices

### 1. Webhook Security
Add authentication to your webhook:
```javascript
// In the "Validate Order Success" node, add:
if ($json.source !== 'nuvante-orders-api') {
  return false;
}
```

### 2. Rate Limiting
Configure n8n to handle high order volumes:
- Set execution limits
- Enable queue mode for high traffic

### 3. Error Handling
The workflow includes:
- ✅ Input validation
- ❌ Error responses for invalid data
- 🔄 Retry logic for failed emails
- 📝 Comprehensive logging

## 📊 Monitoring & Analytics

### N8N Execution Logs
Monitor in N8N dashboard:
- Execution history
- Success/failure rates
- Processing times

### Backend Logs
Check your Nuvante backend logs for:
```
✅ N8N email automation triggered successfully
⚠️ N8N webhook failed: [error details]
```

## 🐛 Troubleshooting

### Common Issues

1. **Emails Not Sending**
   - Check SMTP credentials
   - Verify Gmail app password
   - Check spam folders

2. **Webhook Not Triggering**
   - Verify N8N_WEBHOOK_URL environment variable
   - Check n8n instance is running
   - Test webhook URL directly

3. **Template Rendering Issues**
   - Check for JSON parsing errors
   - Verify all required fields are present
   - Test with minimal data first

### Debug Mode

Enable in the "Process Order Data" node:
```javascript
console.log('Order Data:', JSON.stringify(orderData, null, 2));
return { orderData, itemsHtml, couponHtml, debug: true };
```

## 🚀 Deployment Checklist

- [ ] N8N instance is running and accessible
- [ ] SMTP credentials configured and tested
- [ ] Webhook URL added to environment variables
- [ ] Workflow imported and activated
- [ ] Test emails sent successfully
- [ ] Admin recipients configured
- [ ] Email templates customized
- [ ] Error handling tested
- [ ] Production URLs updated

## 📞 Support

If you encounter issues:
1. Check n8n execution logs
2. Verify backend webhook calls
3. Test SMTP connection
4. Review email template syntax

The setup is designed to be non-intrusive - if n8n fails, orders will still process successfully without affecting the customer experience.

## 🎯 Expected Results

After setup, every successful order will:
1. ✅ Process normally in your backend
2. 📧 Trigger beautiful customer confirmation email
3. 🔔 Send admin notification with order details
4. 📝 Log execution in n8n dashboard
5. 🔄 Handle errors gracefully without affecting orders

**Enjoy automated order notifications! 🎉** 