import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connect from '../../../../db';
import AdminEmail from '../../../../models/AdminEmails';
import EmailTemplate from '../../../../models/EmailTemplate';

// Check if user is admin
async function checkAdminStatus(userEmail: string): Promise<boolean> {
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
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Order Confirmation</title>
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
            padding: 30px; 
            text-align: center; 
        }
        .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; }
        .content { padding: 30px; }
        .order-info { 
            background: #f8f9fa; 
            padding: 20px; 
            border-radius: 8px; 
            margin: 20px 0; 
            border-left: 4px solid #667eea;
        }
        .order-info h3 { margin: 0 0 15px 0; color: #667eea; }
        .order-detail { margin: 8px 0; display: flex; justify-content: space-between; }
        .order-detail strong { color: #333; }
        .items-section { margin: 25px 0; }
        .items-title { 
            color: #667eea; 
            font-size: 18px; 
            font-weight: 600; 
            margin-bottom: 15px; 
            border-bottom: 2px solid #e9ecef; 
            padding-bottom: 10px;
        }
        .item-list { 
            background: #f8f9fa; 
            padding: 20px; 
            border-radius: 8px; 
            white-space: pre-line; 
            font-family: 'Segoe UI', sans-serif;
            line-height: 1.8;
        }
        .shipping-section {
            margin: 25px 0;
            padding: 20px;
            background: #e3f2fd;
            border-radius: 8px;
            border-left: 4px solid #2196f3;
        }
        .shipping-section h3 { margin: 0 0 15px 0; color: #1976d2; }
        .shipping-address { white-space: pre-line; line-height: 1.6; }
        .button { 
            display: inline-block; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 14px 28px; 
            text-decoration: none; 
            border-radius: 8px; 
            margin: 20px 0; 
            font-weight: 600;
            text-align: center;
        }
        .footer { 
            text-align: center; 
            margin-top: 30px; 
            padding-top: 20px; 
            border-top: 1px solid #e9ecef; 
            color: #666; 
        }
        .footer p { margin: 5px 0; }
        .highlight { background: #fff3cd; padding: 2px 6px; border-radius: 4px; }
        .success-badge { 
            display: inline-block; 
            background: #d4edda; 
            color: #155724; 
            padding: 8px 12px; 
            border-radius: 20px; 
            font-size: 14px; 
            font-weight: 600; 
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Order Confirmed!</h1>
            <p>Thank you for shopping with us, {{customer_name}}!</p>
            <div class="success-badge">✅ Payment Successful</div>
        </div>
        
        <div class="content">
            <div class="order-info">
                <h3>📋 Order Details</h3>
                <div class="order-detail">
                    <span>Order ID:</span>
                    <strong>{{order_id}}</strong>
                </div>
                <div class="order-detail">
                    <span>Order Date:</span>
                    <strong>{{order_date}} at {{order_time}}</strong>
                </div>
                <div class="order-detail">
                    <span>Total Amount:</span>
                    <strong class="highlight">{{total_amount}}</strong>
                </div>
                <div class="order-detail">
                    <span>Payment Method:</span>
                    <strong>{{payment_method}}</strong>
                </div>
                <div class="order-detail">
                    <span>Estimated Delivery:</span>
                    <strong>{{estimated_delivery}}</strong>
                </div>
            </div>
            
            <div class="items-section">
                <div class="items-title">🛍️ Items Ordered ({{order_items_count}} items)</div>
                <div class="item-list">{{order_items}}</div>
            </div>
            
            <div class="shipping-section">
                <h3>🚚 Shipping Information</h3>
                <div class="shipping-address">{{shipping_address}}</div>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{website_url}}/orders/{{order_id}}" class="button">
                    📦 Track Your Order
                </a>
            </div>
            
            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h4 style="margin: 0 0 10px 0; color: #2e7d32;">📞 Need Help?</h4>
                <p style="margin: 0;">Our support team is here to help! Contact us at <strong>{{support_email}}</strong> or visit our help center.</p>
            </div>
        </div>
        
        <div class="footer">
            <p>Thank you for choosing {{website_name}}!</p>
            <p>We'll send you updates when your order ships.</p>
            <p style="font-size: 12px; margin-top: 15px;">
                © {{current_year}} {{website_name}}. All rights reserved.
            </p>
        </div>
    </div>
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
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Order Shipped</title>
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
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%); 
            color: white; 
            padding: 30px; 
            text-align: center; 
        }
        .tracking-box {
            background: #e8f5e8;
            padding: 25px;
            border-radius: 8px;
            margin: 25px 0;
            border-left: 5px solid #28a745;
            text-align: center;
        }
        .tracking-id {
            font-size: 24px;
            font-weight: 600;
            color: #155724;
            margin: 10px 0;
        }
        .button { 
            display: inline-block; 
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%); 
            color: white; 
            padding: 15px 30px; 
            text-decoration: none; 
            border-radius: 8px; 
            margin: 15px 0; 
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📦 Your Order is On the Way!</h1>
            <p>Great news {{customer_name}}! Your order has shipped.</p>
        </div>
        
        <div style="padding: 30px;">
            <div class="tracking-box">
                <h3 style="margin: 0; color: #155724;">📍 Tracking Information</h3>
                <div class="tracking-id">{{tracking_id}}</div>
                <p style="margin: 10px 0 0 0;">Use this tracking ID to monitor your shipment</p>
            </div>
            
            <p><strong>Order ID:</strong> {{order_id}}</p>
            <p><strong>Estimated Delivery:</strong> {{estimated_delivery}}</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{tracking_url}}" class="button">🔍 Track Package</a>
            </div>
        </div>
    </div>
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