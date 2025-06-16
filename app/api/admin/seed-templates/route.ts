import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connect from '../../../../db';
import AdminEmail from '../../../../models/AdminEmails';
import EmailTemplate from '../../../../models/EmailTemplate';

// Hardcoded fallback admin emails (these will always be admins)
const FALLBACK_ADMINS = [
  'admin@nuvante.com',
  'ameykurade60@gmail.com',
  'support@nuvante.in',
  'alan.noble777@gmail.com',
];

// Check if user is admin
async function checkAdminStatus(userEmail: string): Promise<boolean> {
  // Check fallback admins first
  if (FALLBACK_ADMINS.includes(userEmail.toLowerCase())) {
    return true;
  }

  try {
    await connect();
    const adminRecord = await AdminEmail.findOne({ 
      email: userEmail.toLowerCase(), 
      isActive: true 
    });
    return !!adminRecord;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

const defaultTemplates = [
  {
    name: 'Order Confirmation',
    subject: 'Order Confirmed - {{order_id}} 🎉',
    templateType: 'order_confirmation',
    htmlContent: `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="x-apple-disable-message-reformatting">
    <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
    <title>Order Confirmation - {{order_id}}</title>
    
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
    
    <style>
        /* Reset and base styles */
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        
        /* Professional fonts */
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background-color: #f6f9fc;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            color: #1a1a1a;
            line-height: 1.6;
        }
        
        /* Email container */
        .email-wrapper {
            width: 100%;
            table-layout: fixed;
            background-color: #f6f9fc;
            padding: 40px 0;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.02);
        }
        
        /* Header with logo */
        .header {
            background: linear-gradient(135deg, #DB4444 0%, #c73e3e 100%);
            padding: 40px 30px;
            text-align: center;
            position: relative;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="2" fill="rgba(255,255,255,0.1)"/><circle cx="80" cy="30" r="1.5" fill="rgba(255,255,255,0.1)"/><circle cx="60" cy="70" r="1" fill="rgba(255,255,255,0.1)"/></svg>');
            pointer-events: none;
        }
        
        .logo {
            margin-bottom: 20px;
            position: relative;
            z-index: 1;
        }
        
        .logo img {
            max-width: 180px;
            height: auto;
            filter: brightness(0) invert(1);
        }
        
        .header h1 {
            color: white;
            font-size: 32px;
            font-weight: 700;
            margin: 0 0 12px 0;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
            position: relative;
            z-index: 1;
        }
        
        .header p {
            color: rgba(255,255,255,0.9);
            font-size: 18px;
            margin: 0;
            position: relative;
            z-index: 1;
        }
        
        .status-badge {
            display: inline-block;
            background: rgba(255,255,255,0.2);
            backdrop-filter: blur(10px);
            color: white;
            padding: 12px 24px;
            border-radius: 25px;
            font-weight: 600;
            font-size: 14px;
            margin-top: 20px;
            border: 1px solid rgba(255,255,255,0.3);
            position: relative;
            z-index: 1;
        }
        
        /* Content sections */
        .content {
            padding: 40px 30px;
        }
        
        .greeting {
            font-size: 24px;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 16px;
        }
        
        .intro-text {
            font-size: 16px;
            color: #525252;
            line-height: 1.6;
            margin-bottom: 32px;
        }
        
        /* Order summary card */
        .order-summary {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 24px;
            margin: 24px 0;
            position: relative;
        }
        
        .order-summary::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #DB4444, #c73e3e);
            border-radius: 12px 12px 0 0;
        }
        
        .order-summary h3 {
            color: #0f172a;
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .order-detail {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #e2e8f0;
        }
        
        .order-detail:last-child {
            border-bottom: none;
        }
        
        .order-detail .label {
            color: #64748b;
            font-weight: 500;
        }
        
        .order-detail .value {
            color: #0f172a;
            font-weight: 600;
        }
        
        /* Items section */
        .items-section {
            margin: 32px 0;
        }
        
        .section-title {
            font-size: 20px;
            font-weight: 600;
            color: #0f172a;
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .items-container {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 20px;
            white-space: pre-line;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', monospace;
            line-height: 1.8;
            color: #374151;
        }
        
        /* Total amount highlight */
        .total-highlight {
            background: linear-gradient(135deg, #DB4444 0%, #c73e3e 100%);
            color: white;
            padding: 24px;
            border-radius: 12px;
            text-align: center;
            margin: 24px 0;
            box-shadow: 0 10px 25px rgba(219, 68, 68, 0.2);
        }
        
        .total-highlight .label {
            font-size: 14px;
            opacity: 0.9;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .total-highlight .amount {
            font-size: 36px;
            font-weight: 700;
            margin: 0;
        }
        
        /* Shipping section */
        .shipping-section {
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
            border: 1px solid #93c5fd;
            border-radius: 12px;
            padding: 24px;
            margin: 24px 0;
        }
        
        .shipping-section h3 {
            color: #1e40af;
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .shipping-address {
            color: #1e3a8a;
            line-height: 1.6;
            white-space: pre-line;
        }
        
        /* CTA Button */
        .cta-section {
            text-align: center;
            margin: 32px 0;
        }
        
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #DB4444 0%, #c73e3e 100%);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            transition: all 0.2s ease;
            box-shadow: 0 4px 12px rgba(219, 68, 68, 0.3);
        }
        
        .cta-button:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 20px rgba(219, 68, 68, 0.4);
        }
        
        /* Help section */
        .help-section {
            background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
            border: 1px solid #86efac;
            border-radius: 12px;
            padding: 24px;
            margin: 24px 0;
        }
        
        .help-section h4 {
            color: #065f46;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .help-section p {
            color: #047857;
            margin: 0;
            line-height: 1.6;
        }
        
        /* Footer */
        .footer {
            background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        
        .footer-content {
            margin-bottom: 24px;
        }
        
        .footer h3 {
            font-size: 18px;
            margin-bottom: 16px;
            color: white;
        }
        
        .footer p {
            color: rgba(255,255,255,0.8);
            margin: 8px 0;
            line-height: 1.6;
        }
        
        .footer a {
            color: #DB4444;
            text-decoration: none;
            font-weight: 600;
        }
        
        .footer a:hover {
            text-decoration: underline;
        }
        
        .footer-legal {
            border-top: 1px solid rgba(255,255,255,0.1);
            padding-top: 24px;
            font-size: 12px;
            color: rgba(255,255,255,0.6);
            line-height: 1.5;
        }
        
        /* Responsive design */
        @media (max-width: 600px) {
            .email-wrapper { padding: 20px 0; }
            .email-container { margin: 0 20px; }
            .header, .content, .footer { padding-left: 20px; padding-right: 20px; }
            .header h1 { font-size: 28px; }
            .greeting { font-size: 20px; }
            .order-detail { flex-direction: column; align-items: flex-start; gap: 4px; }
            .total-highlight .amount { font-size: 28px; }
        }
        
        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
            .email-container { background: #ffffff; }
            /* Keep light theme for better compatibility */
        }
    </style>
</head>
<body>
    <table role="presentation" class="email-wrapper" cellpadding="0" cellspacing="0" border="0">
        <tr>
            <td align="center">
                <div class="email-container">
                    <!-- Header with Logo -->
                    <div class="header">
                        <div class="logo">
                            <img src="https://cdn.jsdelivr.net/gh/nuvante/brand-assets@main/logo-white.png" alt="{{website_name}}" style="max-width: 180px; height: auto;">
                        </div>
                        <h1>🎉 Order Confirmed!</h1>
                        <p>Thank you for choosing {{website_name}}, {{customer_name}}!</p>
                        <div class="status-badge">✅ Payment Successful</div>
                    </div>
                    
                    <!-- Main Content -->
                    <div class="content">
                        <div class="greeting">Hello {{customer_name}}! 👋</div>
                        
                        <div class="intro-text">
                            We're absolutely thrilled to confirm that your order has been successfully placed! Our team is already preparing your premium items with the utmost care and attention to detail.
                        </div>
                        
                        <!-- Order Summary -->
                        <div class="order-summary">
                            <h3>📋 Order Summary</h3>
                            <div class="order-detail">
                                <span class="label">Order ID</span>
                                <span class="value">{{order_id}}</span>
                            </div>
                            <div class="order-detail">
                                <span class="label">Order Date</span>
                                <span class="value">{{order_date}} at {{order_time}}</span>
                            </div>
                            <div class="order-detail">
                                <span class="label">Payment Method</span>
                                <span class="value">{{payment_method}}</span>
                            </div>
                            <div class="order-detail">
                                <span class="label">Estimated Delivery</span>
                                <span class="value">{{estimated_delivery}}</span>
                            </div>
                        </div>
                        
                        <!-- Items Section -->
                        <div class="items-section">
                            <div class="section-title">🛍️ Your Items ({{order_items_count}} items)</div>
                            <div class="items-container">{{order_items}}</div>
                        </div>
                        
                        <!-- Total Amount -->
                        <div class="total-highlight">
                            <div class="label">Total Amount Paid</div>
                            <div class="amount">{{total_amount}}</div>
                        </div>
                        
                        <!-- Shipping Information -->
                        <div class="shipping-section">
                            <h3>🚚 Shipping Information</h3>
                            <div class="shipping-address">{{shipping_address}}</div>
                        </div>
                        
                        <!-- CTA Button -->
                        <div class="cta-section">
                            <a href="{{website_url}}/orders/{{order_id}}" class="cta-button">
                                📦 Track Your Order
                            </a>
                        </div>
                        
                        <!-- Help Section -->
                        <div class="help-section">
                            <h4>💬 Need Assistance?</h4>
                            <p>Our dedicated support team is available 24/7 to help you with any questions. Reach out to us at <strong>{{support_email}}</strong> or visit our comprehensive help center.</p>
                        </div>
                    </div>
                    
                    <!-- Footer -->
                    <div class="footer">
                        <div class="footer-content">
                            <h3>Thank you for choosing {{website_name}}!</h3>
                            <p>We'll keep you updated every step of the way.</p>
                            <p>📧 <a href="mailto:{{support_email}}">{{support_email}}</a></p>
                            <p>🌐 <a href="{{website_url}}">{{website_url}}</a></p>
                        </div>
                        
                        <div class="footer-legal">
                            <p>© {{current_year}} {{website_name}}. All rights reserved.</p>
                            <p>This email was sent because you placed an order with us.</p>
                            <p>If you have any questions, please don't hesitate to contact our support team.</p>
                        </div>
                    </div>
                </div>
            </td>
        </tr>
    </table>
</body>
</html>`,
    plainTextContent: `🎉 ORDER CONFIRMED!

Hello {{customer_name}},

Thank you for your order! We're excited to get your items to you.

📋 ORDER DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Order ID: {{order_id}}
Order Date: {{order_date}} at {{order_time}}
Total Amount: {{total_amount}}
Payment Method: {{payment_method}}
Estimated Delivery: {{estimated_delivery}}

🛍️ ITEMS ORDERED ({{order_items_count}} items)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{{order_items}}

🚚 SHIPPING INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{{shipping_address}}

📦 TRACK YOUR ORDER
Visit: {{website_url}}/orders/{{order_id}}

📞 NEED HELP?
Contact our support team at {{support_email}}

Thank you for choosing {{website_name}}!
We'll send you updates when your order ships.

© {{current_year}} {{website_name}}. All rights reserved.`,
    variables: [
      { name: 'customer_name', description: 'Customer full name', example: 'John Doe' },
      { name: 'order_id', description: 'Unique order identifier', example: 'ORD-123456' },
      { name: 'order_date', description: 'Order date', example: '15/06/2024' },
      { name: 'order_time', description: 'Order time', example: '2:30 PM' },
      { name: 'total_amount', description: 'Order total with currency', example: '₹1,299' },
      { name: 'payment_method', description: 'Payment method used', example: 'Credit Card' },
      { name: 'estimated_delivery', description: 'Expected delivery date', example: '20/06/2024' },
      { name: 'order_items', description: 'Formatted list of ordered items with details', example: '• Nuvante Classic T-Shirt\n  Size: M | Qty: 2 | Price: ₹599\n  Subtotal: ₹1,198' },
      { name: 'order_items_count', description: 'Number of items ordered', example: '3' },
      { name: 'shipping_address', description: 'Formatted shipping address', example: 'John Doe\n123 Main Street\nMumbai 400001\nPhone: +91 9876543210' }
    ]
  },
  {
    name: 'Welcome Email',
    subject: 'Welcome to {{website_name}}! 🎉',
    templateType: 'welcome',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Welcome to Nuvante</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px; 
            background-color: #f8f9fa;
        }
        .container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 40px 30px; 
            text-align: center; 
        }
        .header h1 { margin: 0; font-size: 32px; font-weight: 600; }
        .header p { margin: 15px 0 0 0; opacity: 0.9; font-size: 18px; }
        .content { padding: 40px 30px; }
        .welcome-box { 
            background: #f8f9fa; 
            padding: 25px; 
            border-radius: 12px; 
            margin: 25px 0; 
            border-left: 5px solid #667eea;
        }
        .feature-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin: 30px 0;
        }
        .feature-item {
            background: #fff;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #e9ecef;
            text-align: center;
        }
        .feature-emoji { font-size: 32px; margin-bottom: 10px; }
        .button { 
            display: inline-block; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 15px 30px; 
            text-decoration: none; 
            border-radius: 8px; 
            margin: 15px 10px; 
            font-weight: 600;
            text-align: center;
        }
        .button-secondary {
            background: #6c757d;
        }
        .footer { 
            text-align: center; 
            margin-top: 40px; 
            padding-top: 30px; 
            border-top: 1px solid #e9ecef; 
            color: #666; 
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Welcome to {{website_name}}!</h1>
            <p>We're thrilled to have you join our community</p>
        </div>
        
        <div class="content">
            <h2>Hello {{customer_name}}! 👋</h2>
            
            <div class="welcome-box">
                <p style="margin: 0; font-size: 16px;">{{welcome_message}}</p>
            </div>
            
            <p>You're now part of our growing community of fashion enthusiasts. Here's what you can do next:</p>
            
            <div class="feature-grid">
                <div class="feature-item">
                    <div class="feature-emoji">🛍️</div>
                    <h4>Shop Latest Collection</h4>
                    <p>Browse our newest arrivals and trending styles</p>
                </div>
                <div class="feature-item">
                    <div class="feature-emoji">👤</div>
                    <h4>Complete Your Profile</h4>
                    <p>Set your preferences for personalized recommendations</p>
                </div>
                <div class="feature-item">
                    <div class="feature-emoji">📧</div>
                    <h4>Join Newsletter</h4>
                    <p>Get exclusive deals and early access to sales</p>
                </div>
                <div class="feature-item">
                    <div class="feature-emoji">📱</div>
                    <h4>Follow Us</h4>
                    <p>Stay updated with our latest drops on social media</p>
                </div>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{getting_started_url}}" class="button">🚀 Get Started</a>
                <a href="{{website_url}}" class="button button-secondary">🛒 Shop Now</a>
            </div>
            
            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <h4 style="margin: 0 0 10px 0; color: #2e7d32;">💬 Questions?</h4>
                <p style="margin: 0;">Our support team is here to help! Reach out at <strong>{{support_email}}</strong></p>
            </div>
        </div>
        
        <div class="footer">
            <p>Thank you for choosing {{website_name}}!</p>
            <p style="font-size: 12px; margin-top: 15px;">
                © {{current_year}} {{website_name}}. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>`,
    plainTextContent: `🎉 WELCOME TO {{website_name}}!

Hello {{customer_name}}! 👋

{{welcome_message}}

You're now part of our growing community of fashion enthusiasts. Here's what you can do next:

🛍️ SHOP LATEST COLLECTION
Browse our newest arrivals and trending styles

👤 COMPLETE YOUR PROFILE  
Set your preferences for personalized recommendations

📧 JOIN NEWSLETTER
Get exclusive deals and early access to sales

📱 FOLLOW US
Stay updated with our latest drops on social media

🚀 GET STARTED: {{getting_started_url}}
🛒 SHOP NOW: {{website_url}}

💬 QUESTIONS?
Our support team is here to help! Reach out at {{support_email}}

Thank you for choosing {{website_name}}!

© {{current_year}} {{website_name}}. All rights reserved.`,
    variables: [
      { name: 'customer_name', description: 'Customer full name', example: 'John Doe' },
      { name: 'welcome_message', description: 'Personal welcome message', example: 'Welcome to our fashion community!' },
      { name: 'getting_started_url', description: 'Getting started page URL', example: '/welcome' }
    ]
  },
  {
    name: 'Order Shipped',
    subject: 'Your Order is On the Way! 📦 - {{order_id}}',
    templateType: 'order_shipped',
    htmlContent: `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="x-apple-disable-message-reformatting">
    <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
    <title>Order Shipped - {{order_id}}</title>
    
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
    
    <style>
        /* Reset and base styles */
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        
        /* Professional fonts */
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background-color: #f6f9fc;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            color: #1a1a1a;
            line-height: 1.6;
        }
        
        /* Email container */
        .email-wrapper {
            width: 100%;
            table-layout: fixed;
            background-color: #f6f9fc;
            padding: 40px 0;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.02);
        }
        
        /* Header with shipping animation */
        .header {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            padding: 40px 30px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100"><path d="M20,50 Q60,20 100,50 T180,50" stroke="rgba(255,255,255,0.2)" stroke-width="2" fill="none"/><circle cx="20" cy="50" r="3" fill="rgba(255,255,255,0.3)"/><circle cx="180" cy="50" r="3" fill="rgba(255,255,255,0.3)"/></svg>') center;
            animation: float 3s ease-in-out infinite;
            pointer-events: none;
        }
        
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
        }
        
        .logo {
            margin-bottom: 20px;
            position: relative;
            z-index: 1;
        }
        
        .logo img {
            max-width: 180px;
            height: auto;
            filter: brightness(0) invert(1);
        }
        
        .header h1 {
            color: white;
            font-size: 32px;
            font-weight: 700;
            margin: 0 0 12px 0;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
            position: relative;
            z-index: 1;
        }
        
        .header p {
            color: rgba(255,255,255,0.9);
            font-size: 18px;
            margin: 0;
            position: relative;
            z-index: 1;
        }
        
        .status-badge {
            display: inline-block;
            background: rgba(255,255,255,0.2);
            backdrop-filter: blur(10px);
            color: white;
            padding: 12px 24px;
            border-radius: 25px;
            font-weight: 600;
            font-size: 14px;
            margin-top: 20px;
            border: 1px solid rgba(255,255,255,0.3);
            position: relative;
            z-index: 1;
        }
        
        /* Content sections */
        .content {
            padding: 40px 30px;
        }
        
        .greeting {
            font-size: 24px;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 16px;
        }
        
        .intro-text {
            font-size: 16px;
            color: #525252;
            line-height: 1.6;
            margin-bottom: 32px;
        }
        
        /* Tracking highlight */
        .tracking-hero {
            background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
            border: 2px solid #10b981;
            border-radius: 16px;
            padding: 32px;
            text-align: center;
            margin: 32px 0;
            position: relative;
            overflow: hidden;
        }
        
        .tracking-hero::before {
            content: '📦';
            position: absolute;
            top: -10px;
            right: -10px;
            font-size: 60px;
            opacity: 0.1;
            transform: rotate(15deg);
        }
        
        .tracking-hero h3 {
            color: #065f46;
            font-size: 22px;
            font-weight: 700;
            margin-bottom: 16px;
        }
        
        .tracking-id {
            background: white;
            border: 2px dashed #10b981;
            border-radius: 8px;
            padding: 16px;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 20px;
            font-weight: 700;
            color: #065f46;
            letter-spacing: 2px;
            margin: 16px 0;
            word-break: break-all;
        }
        
        .tracking-instructions {
            color: #047857;
            font-size: 14px;
            margin-top: 12px;
        }
        
        /* Order summary card */
        .order-summary {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 24px;
            margin: 24px 0;
            position: relative;
        }
        
        .order-summary::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #10b981, #059669);
            border-radius: 12px 12px 0 0;
        }
        
        .order-summary h3 {
            color: #0f172a;
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .order-detail {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #e2e8f0;
        }
        
        .order-detail:last-child {
            border-bottom: none;
        }
        
        .order-detail .label {
            color: #64748b;
            font-weight: 500;
        }
        
        .order-detail .value {
            color: #0f172a;
            font-weight: 600;
        }
        
        /* Progress timeline */
        .progress-timeline {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 24px;
            margin: 24px 0;
        }
        
        .progress-step {
            display: flex;
            align-items: center;
            margin-bottom: 16px;
            position: relative;
        }
        
        .progress-step:last-child {
            margin-bottom: 0;
        }
        
        .progress-step::before {
            content: '';
            position: absolute;
            left: 12px;
            top: 30px;
            width: 2px;
            height: 20px;
            background: #e2e8f0;
        }
        
        .progress-step:last-child::before {
            display: none;
        }
        
        .progress-step.completed::before {
            background: #10b981;
        }
        
        .progress-icon {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 16px;
            flex-shrink: 0;
            font-size: 12px;
            position: relative;
            z-index: 1;
        }
        
        .progress-step.completed .progress-icon {
            background: #10b981;
            color: white;
        }
        
        .progress-step.current .progress-icon {
            background: #fbbf24;
            color: white;
            animation: pulse 2s infinite;
        }
        
        .progress-step.pending .progress-icon {
            background: #e2e8f0;
            color: #9ca3af;
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }
        
        .progress-content h4 {
            color: #0f172a;
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 4px;
        }
        
        .progress-content p {
            color: #64748b;
            font-size: 14px;
            margin: 0;
        }
        
        .progress-step.completed .progress-content h4 {
            color: #059669;
        }
        
        .progress-step.current .progress-content h4 {
            color: #d97706;
        }
        
        /* CTA Button */
        .cta-section {
            text-align: center;
            margin: 32px 0;
        }
        
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            transition: all 0.2s ease;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }
        
        .cta-button:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
        }
        
        /* Delivery info */
        .delivery-info {
            background: linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%);
            border: 1px solid #f59e0b;
            border-radius: 12px;
            padding: 24px;
            margin: 24px 0;
        }
        
        .delivery-info h4 {
            color: #92400e;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .delivery-info p {
            color: #b45309;
            margin: 0;
            line-height: 1.6;
        }
        
        /* Footer */
        .footer {
            background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        
        .footer-content {
            margin-bottom: 24px;
        }
        
        .footer h3 {
            font-size: 18px;
            margin-bottom: 16px;
            color: white;
        }
        
        .footer p {
            color: rgba(255,255,255,0.8);
            margin: 8px 0;
            line-height: 1.6;
        }
        
        .footer a {
            color: #10b981;
            text-decoration: none;
            font-weight: 600;
        }
        
        .footer a:hover {
            text-decoration: underline;
        }
        
        .footer-legal {
            border-top: 1px solid rgba(255,255,255,0.1);
            padding-top: 24px;
            font-size: 12px;
            color: rgba(255,255,255,0.6);
            line-height: 1.5;
        }
        
        /* Responsive design */
        @media (max-width: 600px) {
            .email-wrapper { padding: 20px 0; }
            .email-container { margin: 0 20px; }
            .header, .content, .footer { padding-left: 20px; padding-right: 20px; }
            .header h1 { font-size: 28px; }
            .greeting { font-size: 20px; }
            .order-detail { flex-direction: column; align-items: flex-start; gap: 4px; }
            .tracking-hero { padding: 24px 20px; }
            .tracking-id { font-size: 16px; letter-spacing: 1px; }
        }
    </style>
</head>
<body>
    <table role="presentation" class="email-wrapper" cellpadding="0" cellspacing="0" border="0">
        <tr>
            <td align="center">
                <div class="email-container">
                    <!-- Header with Logo -->
                    <div class="header">
                        <div class="logo">
                            <img src="https://cdn.jsdelivr.net/gh/nuvante/brand-assets@main/logo-white.png" alt="{{website_name}}" style="max-width: 180px; height: auto;">
                        </div>
                        <h1>📦 Your Order is On the Way!</h1>
                        <p>Great news {{customer_name}}! Your package has shipped.</p>
                        <div class="status-badge">🚛 In Transit</div>
                    </div>
                    
                    <!-- Main Content -->
                    <div class="content">
                        <div class="greeting">Exciting Update! 🎉</div>
                        
                        <div class="intro-text">
                            Your {{website_name}} order is now on its way to you! We've carefully packaged your items and handed them over to our trusted shipping partner for safe delivery.
                        </div>
                        
                        <!-- Tracking Hero Section -->
                        <div class="tracking-hero">
                            <h3>📍 Track Your Package</h3>
                            <div class="tracking-id">{{tracking_id}}</div>
                            <div class="tracking-instructions">
                                Use this tracking number to monitor your shipment's progress in real-time
                            </div>
                        </div>
                        
                        <!-- Order Summary -->
                        <div class="order-summary">
                            <h3>📋 Shipment Details</h3>
                            <div class="order-detail">
                                <span class="label">Order ID</span>
                                <span class="value">{{order_id}}</span>
                            </div>
                            <div class="order-detail">
                                <span class="label">Tracking Number</span>
                                <span class="value">{{tracking_id}}</span>
                            </div>
                            <div class="order-detail">
                                <span class="label">Shipping Method</span>
                                <span class="value">{{shipping_method}}</span>
                            </div>
                            <div class="order-detail">
                                <span class="label">Estimated Delivery</span>
                                <span class="value">{{estimated_delivery}}</span>
                            </div>
                        </div>
                        
                        <!-- Progress Timeline -->
                        <div class="progress-timeline">
                            <h3 style="color: #0f172a; margin-bottom: 20px; font-size: 18px;">📈 Shipping Progress</h3>
                            
                            <div class="progress-step completed">
                                <div class="progress-icon">✓</div>
                                <div class="progress-content">
                                    <h4>Order Confirmed</h4>
                                    <p>Your order was received and confirmed</p>
                                </div>
                            </div>
                            
                            <div class="progress-step completed">
                                <div class="progress-icon">✓</div>
                                <div class="progress-content">
                                    <h4>Items Prepared</h4>
                                    <p>Your items were carefully packaged</p>
                                </div>
                            </div>
                            
                            <div class="progress-step current">
                                <div class="progress-icon">🚛</div>
                                <div class="progress-content">
                                    <h4>In Transit</h4>
                                    <p>Your package is on its way to you</p>
                                </div>
                            </div>
                            
                            <div class="progress-step pending">
                                <div class="progress-icon">📦</div>
                                <div class="progress-content">
                                    <h4>Out for Delivery</h4>
                                    <p>Package will be delivered soon</p>
                                </div>
                            </div>
                            
                            <div class="progress-step pending">
                                <div class="progress-icon">✨</div>
                                <div class="progress-content">
                                    <h4>Delivered</h4>
                                    <p>Package successfully delivered</p>
                                </div>
                            </div>
                        </div>
                        
                        <!-- CTA Button -->
                        <div class="cta-section">
                            <a href="{{tracking_url}}" class="cta-button">
                                🔍 Track Your Package
                            </a>
                        </div>
                        
                        <!-- Delivery Information -->
                        <div class="delivery-info">
                            <h4>🏠 Delivery Information</h4>
                            <p><strong>Estimated Delivery:</strong> {{estimated_delivery}}</p>
                            <p><strong>Delivery Address:</strong> {{shipping_address}}</p>
                            <p>📱 You'll receive SMS updates when your package is out for delivery and when it's delivered.</p>
                        </div>
                    </div>
                    
                    <!-- Footer -->
                    <div class="footer">
                        <div class="footer-content">
                            <h3>We're here to help! 🤝</h3>
                            <p>Questions about your shipment? Our support team is ready to assist.</p>
                            <p>📧 <a href="mailto:{{support_email}}">{{support_email}}</a></p>
                            <p>🌐 <a href="{{website_url}}">{{website_url}}</a></p>
                        </div>
                        
                        <div class="footer-legal">
                            <p>© {{current_year}} {{website_name}}. All rights reserved.</p>
                            <p>This shipping notification was sent because your order is in transit.</p>
                            <p>For tracking updates, visit the link above or contact our support team.</p>
                        </div>
                    </div>
                </div>
            </td>
        </tr>
    </table>
</body>
</html>`,
    plainTextContent: `📦 YOUR ORDER IS ON THE WAY!

Hello {{customer_name}}!

Great news! Your order has been shipped and is on its way to you.

📍 TRACKING INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tracking ID: {{tracking_id}}
Order ID: {{order_id}}
Estimated Delivery: {{estimated_delivery}}

🔍 TRACK YOUR PACKAGE
{{tracking_url}}

Thank you for shopping with {{website_name}}!

© {{current_year}} {{website_name}}. All rights reserved.`,
    variables: [
      { name: 'customer_name', description: 'Customer full name', example: 'John Doe' },
      { name: 'order_id', description: 'Order identifier', example: 'ORD-123456' },
      { name: 'tracking_id', description: 'Shipment tracking ID', example: 'TRK-789012' },
      { name: 'estimated_delivery', description: 'Expected delivery date', example: '25/06/2024' },
      { name: 'tracking_url', description: 'Tracking URL', example: 'https://track.shipper.com/TRK-789012' }
    ]
  }
];

// POST - Seed default email templates
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user email from Clerk
    const userEmail = request.headers.get('x-user-email');
    if (!userEmail || !(await checkAdminStatus(userEmail))) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await connect();

    const createdTemplates = [];
    const skippedTemplates = [];

    for (const templateData of defaultTemplates) {
      // Check if template already exists
      const existingTemplate = await EmailTemplate.findOne({ name: templateData.name });
      
      if (existingTemplate) {
        skippedTemplates.push(templateData.name);
        continue;
      }

      // Create new template
      const template = new EmailTemplate({
        ...templateData,
        createdBy: userEmail,
        lastEditedBy: userEmail,
        isActive: true
      });

      await template.save();
      createdTemplates.push(templateData.name);
    }

    return NextResponse.json({
      success: true,
      message: `Seeding completed. Created ${createdTemplates.length} templates, skipped ${skippedTemplates.length} existing ones.`,
      created: createdTemplates,
      skipped: skippedTemplates
    });
    
  } catch (error: any) {
    console.error('Error seeding templates:', error);
    return NextResponse.json({ 
      error: 'Failed to seed templates',
      details: error.message 
    }, { status: 500 });
  }
} 