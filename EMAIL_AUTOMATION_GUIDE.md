# 📧 Internal Email Automation System

This document describes the new internal email automation system that replaces external services like n8n. The system provides admin-controlled email templates and automated email sending for common events.

## 🚀 Features

- **Admin-Controlled Templates**: Create and edit HTML and plain text email templates
- **Automated Triggers**: Automatic emails for order confirmations, shipping updates, welcome emails, etc.
- **Template Variables**: Dynamic content injection using `{{variable_name}}` syntax
- **Email Logging**: Complete audit trail of all sent emails
- **Webhook Integration**: Internal webhooks replace external automation services
- **Bulk Email Support**: Send emails to multiple recipients
- **Admin Dashboard**: Easy-to-use interface for managing templates and viewing analytics

## 🛠️ Setup

### 1. Database Models
The system uses three main models:
- `EmailTemplate` - Stores email templates with HTML/text content
- `EmailLog` - Logs all sent emails for auditing
- `AdminEmail` - Controls admin access to the system

### 2. Default Templates
Run the seeding endpoint to create default templates:

```bash
POST /api/admin/seed-templates
Headers: x-user-email: your-admin-email@domain.com
```

This creates templates for:
- Order Confirmation
- Welcome Email  
- Order Shipped
- Order Delivered
- Password Reset

### 3. Admin Access
Access the email automation panel at: `/admin/email-automation`

Only users listed in the `AdminEmail` collection can access this panel.

## 📝 Template Variables

Templates support dynamic variables using `{{variable_name}}` syntax:

### System Variables (Always Available)
- `{{current_year}}` - Current year
- `{{current_date}}` - Current date
- `{{current_time}}` - Current time
- `{{website_name}}` - Site name (Nuvante)
- `{{website_url}}` - Site URL
- `{{support_email}}` - Support email

### Order Confirmation Variables
- `{{customer_name}}` - Customer's full name
- `{{order_id}}` - Order identifier
- `{{total_amount}}` - Order total with currency
- `{{order_items}}` - List of ordered items
- `{{shipping_address}}` - Shipping address
- `{{payment_method}}` - Payment method used

### Welcome Email Variables
- `{{customer_name}}` - Customer's full name
- `{{welcome_message}}` - Custom welcome message
- `{{getting_started_url}}` - Getting started page URL

### Shipping Variables
- `{{tracking_number}}` - Package tracking number
- `{{carrier_name}}` - Shipping carrier
- `{{estimated_delivery}}` - Estimated delivery date
- `{{tracking_url}}` - Tracking link

## 🔄 Automation Triggers

### 1. Programmatic Triggers

```typescript
import EmailAutomation from '../lib/emailAutomation';

const automation = EmailAutomation.getInstance();

// Order confirmation
await automation.sendOrderConfirmation({
  orderId: 'ORD-123',
  customerEmail: 'customer@example.com',
  customerName: 'John Doe',
  orderTotal: '$99.99',
  // ... other order data
});

// Welcome email
await automation.sendWelcomeEmail({
  email: 'new-user@example.com',
  name: 'Jane Doe',
  userId: 'user_123'
});

// Shipping notification
await automation.sendOrderShippedEmail({
  orderId: 'ORD-123',
  customerEmail: 'customer@example.com',
  trackingNumber: '1Z999AA1234567890',
  carrierName: 'FedEx'
});
```

### 2. Webhook Integration

Replace external n8n webhook with internal endpoint:

**New Internal Webhook URL:**
```
POST /api/webhooks/order-success
```

**Payload:**
```json
{
  "success": true,
  "orderId": "ORD-123456",
  "customerEmail": "customer@example.com",
  "customerName": "John Doe",
  "orderTotal": "$99.99",
  "orderItems": [
    { "name": "Product A", "quantity": 2, "price": "$50.00" }
  ],
  "shippingAddress": "123 Main St, City, State 12345",
  "paymentMethod": "Credit Card",
  "userId": "user_123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "✅ Order email automation completed successfully!",
  "orderId": "ORD-123456",
  "customerEmail": "customer@example.com",
  "timestamp": "2024-12-19T16:30:00.000Z",
  "webhookUrl": "https://yoursite.com/api/webhooks/order-success",
  "emailSent": true,
  "logId": "email_log_id"
}
```

## 🔧 API Endpoints

### Template Management
- `GET /api/admin/email-templates` - List all templates
- `POST /api/admin/email-templates` - Create new template  
- `GET /api/admin/email-templates/[id]` - Get specific template
- `PUT /api/admin/email-templates/[id]` - Update template
- `DELETE /api/admin/email-templates/[id]` - Delete template

### Email Sending
- `POST /api/admin/send-email` - Send emails (single or bulk)
- `GET /api/admin/email-logs` - View email logs and statistics

### System
- `POST /api/admin/seed-templates` - Create default templates
- `POST /api/webhooks/order-success` - Order success automation

## 👥 Admin Panel Features

Access at `/admin/email-automation`:

### Templates Tab
- View all email templates
- Create/edit templates with HTML and plain text
- Test templates by sending test emails
- Manage template variables and settings

### Logs Tab  
- View recent email activity
- Filter by status, recipient, date range
- See delivery success/failure rates
- Debug failed email attempts

### Analytics Tab
- Email delivery statistics
- Template usage analytics
- Performance metrics

## 🎨 Template Creation

### HTML Template Best Practices
- Use inline CSS for better email client compatibility
- Keep width under 600px for mobile compatibility
- Use tables for layout structure
- Test across different email clients
- Include alt text for images

### Variable Usage
```html
<!-- Basic variable -->
<p>Hello {{customer_name}},</p>

<!-- Conditional content -->
<p>Your order {{order_id}} has been confirmed!</p>

<!-- Links with variables -->
<a href="{{website_url}}/orders/{{order_id}}">Track Order</a>

<!-- System variables -->
<p>© {{current_year}} {{website_name}}</p>
```

### Plain Text Version
Always provide a plain text version for accessibility and email client compatibility.

## 🔍 Testing

### Test Email Templates
1. Go to `/admin/email-automation`
2. Find your template
3. Click "Test" button
4. Enter test email address
5. Check email delivery and formatting

### Test Webhook
```bash
curl -X POST /api/webhooks/order-success \
  -H "Content-Type: application/json" \
  -d '{
    "success": true,
    "orderId": "TEST-123",
    "customerEmail": "test@example.com",
    "customerName": "Test User"
  }'
```

## 🚨 Migration from External Services

### Replacing n8n Workflow
1. Update webhook URLs in your order processing system
2. Change from external service URL to: `/api/webhooks/order-success`
3. Keep the same payload format (mostly compatible)
4. Test the new webhook thoroughly
5. Disable old external workflow

### Data Migration
- Email logs from external services won't be imported
- Template content can be copied from external services
- Update any hardcoded external webhook URLs

## 🛡️ Security & Performance

### Security Features
- Admin-only access to template management
- Input validation on all endpoints
- SQL injection protection via Mongoose
- XSS protection in template rendering

### Performance Features
- Email sending is asynchronous
- Bulk email processing
- Database indexing for fast lookups
- Template caching (future enhancement)

### Monitoring
- All emails are logged for auditing
- Success/failure tracking
- Performance metrics available
- Error logging for debugging

## 🤝 Support

### Common Issues
1. **Templates not sending**: Check template name mapping in automation
2. **Variables not replacing**: Verify variable names match exactly
3. **Access denied**: Ensure user email is in AdminEmail collection
4. **Styling issues**: Test HTML in email client previews

### Getting Help
- Check email logs for delivery issues
- Review error messages in admin panel
- Test templates with simple content first
- Verify all required variables are provided

## 🔮 Future Enhancements

- **Email Provider Integration**: SendGrid, SES, Mailgun support
- **Advanced Analytics**: Open rates, click tracking
- **Template Marketplace**: Pre-built template gallery
- **A/B Testing**: Template variation testing
- **Scheduled Emails**: Time-based email automation
- **Email Campaigns**: Newsletter and marketing tools

---

**Need Help?** Check the admin panel logs or contact the development team for assistance. 