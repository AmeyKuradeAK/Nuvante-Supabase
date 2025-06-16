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
    subject: 'Order Confirmation - {{order_id}}',
    templateType: 'order_confirmation',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Order Confirmation</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .order-details { background: white; padding: 15px; margin: 15px 0; border-radius: 6px; border-left: 4px solid #4F46E5; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        .button { display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>✅ Order Confirmed!</h1>
        <p>Thank you for your purchase, {{customer_name}}!</p>
    </div>
    
    <div class="content">
        <h2>Order Details</h2>
        <div class="order-details">
            <p><strong>Order ID:</strong> {{order_id}}</p>
            <p><strong>Order Total:</strong> {{total_amount}}</p>
            <p><strong>Payment Method:</strong> {{payment_method}}</p>
            <p><strong>Shipping Address:</strong><br>{{shipping_address}}</p>
        </div>
        
        <h3>Items Ordered</h3>
        <div class="order-details">
            <pre>{{order_items}}</pre>
        </div>
        
        <p>We'll send you shipping updates when your order is on its way!</p>
        
        <a href="{{website_url}}/orders/{{order_id}}" class="button">Track Your Order</a>
    </div>
    
    <div class="footer">
        <p>Need help? Contact us at {{support_email}}</p>
        <p>© {{current_year}} {{website_name}}. All rights reserved.</p>
    </div>
</body>
</html>`,
    plainTextContent: `Order Confirmation - {{order_id}}

Hello {{customer_name}},

Thank you for your order! Here are the details:

Order ID: {{order_id}}
Total: {{total_amount}}
Payment Method: {{payment_method}}
Shipping Address: {{shipping_address}}

Items Ordered:
{{order_items}}

We'll send you shipping updates when your order is on its way!

Track your order: {{website_url}}/orders/{{order_id}}

Need help? Contact us at {{support_email}}

© {{current_year}} {{website_name}}`,
    variables: [
      { name: 'customer_name', description: 'Customer full name', example: 'John Doe' },
      { name: 'order_id', description: 'Unique order identifier', example: 'ORD-123456' },
      { name: 'total_amount', description: 'Order total with currency', example: '$99.99' },
      { name: 'payment_method', description: 'Payment method used', example: 'Credit Card' },
      { name: 'shipping_address', description: 'Customer shipping address', example: '123 Main St, City, State 12345' },
      { name: 'order_items', description: 'List of ordered items', example: 'Product A (Qty: 2) - $50.00\nProduct B (Qty: 1) - $49.99' }
    ]
  },
  {
    name: 'Welcome Email',
    subject: 'Welcome to {{website_name}}!',
    templateType: 'welcome',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Welcome</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .welcome-box { background: white; padding: 20px; margin: 20px 0; border-radius: 6px; border-left: 4px solid #667eea; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎉 Welcome to {{website_name}}!</h1>
        <p>We're thrilled to have you join our community</p>
    </div>
    
    <div class="content">
        <h2>Hello {{customer_name}}!</h2>
        
        <div class="welcome-box">
            <p>{{welcome_message}}</p>
            <p>You're now part of our growing community of satisfied customers. Here's what you can do next:</p>
            <ul>
                <li>Browse our latest products and collections</li>
                <li>Set up your profile and preferences</li>
                <li>Join our newsletter for exclusive deals</li>
                <li>Follow us on social media for updates</li>
            </ul>
        </div>
        
        <p>If you have any questions, our support team is here to help!</p>
        
        <a href="{{getting_started_url}}" class="button">Get Started</a>
        <a href="{{website_url}}" class="button">Shop Now</a>
    </div>
    
    <div class="footer">
        <p>Need help? Contact us at {{support_email}}</p>
        <p>© {{current_year}} {{website_name}}. All rights reserved.</p>
    </div>
</body>
</html>`,
    plainTextContent: `Welcome to {{website_name}}!

Hello {{customer_name}},

{{welcome_message}}

You're now part of our growing community of satisfied customers. Here's what you can do next:

- Browse our latest products and collections
- Set up your profile and preferences  
- Join our newsletter for exclusive deals
- Follow us on social media for updates

If you have any questions, our support team is here to help!

Get started: {{getting_started_url}}
Shop now: {{website_url}}

Need help? Contact us at {{support_email}}

© {{current_year}} {{website_name}}`,
    variables: [
      { name: 'customer_name', description: 'Customer full name', example: 'John Doe' },
      { name: 'welcome_message', description: 'Personal welcome message', example: 'Welcome to our store!' },
      { name: 'getting_started_url', description: 'Getting started page URL', example: '/welcome' }
    ]
  },
  {
    name: 'Order Shipped',
    subject: 'Your order {{order_id}} has shipped! 📦',
    templateType: 'order_shipped',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Order Shipped</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10B981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .shipping-info { background: white; padding: 15px; margin: 15px 0; border-radius: 6px; border-left: 4px solid #10B981; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        .button { display: inline-block; background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📦 Your order is on its way!</h1>
        <p>Hi {{customer_name}}, your package has shipped</p>
    </div>
    
    <div class="content">
        <h2>Shipping Information</h2>
        <div class="shipping-info">
            <p><strong>Order ID:</strong> {{order_id}}</p>
            <p><strong>Tracking Number:</strong> {{tracking_number}}</p>
            <p><strong>Carrier:</strong> {{carrier_name}}</p>
            <p><strong>Estimated Delivery:</strong> {{estimated_delivery}}</p>
        </div>
        
        <p>Your order is now in transit! You can track your package using the tracking number above or click the button below.</p>
        
        <a href="{{tracking_url}}" class="button">Track Package</a>
        <a href="{{website_url}}/orders/{{order_id}}" class="button">View Order</a>
        
        <p><small>Please note that tracking information may take a few hours to update in the carrier's system.</small></p>
    </div>
    
    <div class="footer">
        <p>Need help? Contact us at {{support_email}}</p>
        <p>© {{current_year}} {{website_name}}. All rights reserved.</p>
    </div>
</body>
</html>`,
    plainTextContent: `Your order {{order_id}} has shipped! 📦

Hi {{customer_name}},

Your order is now in transit! Here are the shipping details:

Order ID: {{order_id}}
Tracking Number: {{tracking_number}}
Carrier: {{carrier_name}}
Estimated Delivery: {{estimated_delivery}}

Track your package: {{tracking_url}}
View your order: {{website_url}}/orders/{{order_id}}

Please note that tracking information may take a few hours to update in the carrier's system.

Need help? Contact us at {{support_email}}

© {{current_year}} {{website_name}}`,
    variables: [
      { name: 'customer_name', description: 'Customer full name', example: 'John Doe' },
      { name: 'order_id', description: 'Unique order identifier', example: 'ORD-123456' },
      { name: 'tracking_number', description: 'Package tracking number', example: '1Z999AA1234567890' },
      { name: 'carrier_name', description: 'Shipping carrier name', example: 'FedEx' },
      { name: 'estimated_delivery', description: 'Estimated delivery date', example: 'March 15, 2024' },
      { name: 'tracking_url', description: 'Tracking URL', example: 'https://track.fedex.com/...' }
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