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

// Professional HTML email template base with logo and styling
const getEmailBase = (content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{subject}}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; background-color: #f8f9fa; }
        .email-container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; }
        .logo { max-width: 180px; height: auto; margin-bottom: 15px; }
        .header h1 { font-size: 28px; font-weight: 600; margin: 0; }
        .content { padding: 40px 30px; }
        .content h2 { color: #2c3e50; font-size: 24px; margin-bottom: 20px; }
        .content p { margin-bottom: 16px; color: #555; }
        .highlight-box { background: #f8f9ff; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 4px; }
        .order-details { background: #fff; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .order-details h3 { color: #2c3e50; margin-bottom: 15px; }
        .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f3f4; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { font-weight: 600; color: #555; }
        .detail-value { color: #333; }
        .btn { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; text-align: center; }
        .btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3); }
        .social-links { text-align: center; margin: 30px 0; }
        .social-links a { display: inline-block; margin: 0 10px; color: #3498db; text-decoration: none; }
        .footer { background: #2c3e50; color: #bdc3c7; padding: 30px; text-align: center; font-size: 14px; }
        .footer a { color: #3498db; text-decoration: none; }
        .divider { height: 1px; background: #e9ecef; margin: 30px 0; }
        @media (max-width: 600px) { 
            .email-container { margin: 0; border-radius: 0; }
            .content { padding: 20px; }
            .header { padding: 20px; }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <img src="https://nuvante.com/logo-white.png" alt="Nuvante Logo" class="logo">
            <h1>Nuvante</h1>
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            <p><strong>Nuvante</strong></p>
            <p>Fashion That Speaks Your Style</p>
            <p>
                <a href="mailto:support@nuvante.in">support@nuvante.in</a> | 
                <a href="https://nuvante.com">nuvante.com</a>
            </p>
            <div class="social-links">
                <a href="https://facebook.com/nuvante">Facebook</a> |
                <a href="https://instagram.com/nuvante">Instagram</a> |
                <a href="https://twitter.com/nuvante">Twitter</a>
            </div>
            <p>&copy; {{current_year}} Nuvante. All rights reserved.</p>
            <a href="{{website_url}}/privacy">Privacy Policy</a></p>
        </div>
    </div>
</body>
</html>
`;

const templates = [
  {
    name: 'order_confirmation',
    subject: '🎉 Order Confirmed #{{order_id}} - Thank You {{customer_name}}!',
    templateType: 'order_confirmation',
    htmlContent: getEmailBase(`
      <h2>🎉 Your Order is Confirmed!</h2>
      <p>Hi {{customer_name}},</p>
      <p>Thank you for your order! We're excited to get your fashion items ready for you.</p>
      
      <div class="highlight-box">
        <p><strong>🚀 What's Next?</strong></p>
        <p>• We'll start processing your order immediately</p>
        <p>• You'll receive tracking information once shipped</p>
        <p>• Estimated delivery: 3-5 business days</p>
      </div>

      <div class="order-details">
        <h3>📋 Order Details</h3>
        <div class="detail-row">
          <span class="detail-label">Order Number:</span>
          <span class="detail-value">#{{order_id}}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Order Date:</span>
          <span class="detail-value">{{order_date}}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Total Amount:</span>
          <span class="detail-value">₹{{order_total}}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Payment Method:</span>
          <span class="detail-value">{{payment_method}}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Shipping Address:</span>
          <span class="detail-value">{{shipping_address}}</span>
        </div>
      </div>

      <div style="text-align: center;">
        <a href="{{website_url}}/orders/{{order_id}}" class="btn">Track Your Order</a>
      </div>

      <div class="divider"></div>
      <p>Questions about your order? Just reply to this email or contact us at {{support_email}}</p>
      <p>Thank you for choosing Nuvante! 💜</p>
    `),
    plainTextContent: `🎉 Your Order is Confirmed!

Hi {{customer_name}},

Thank you for your order! We're excited to get your fashion items ready for you.

Order Details:
- Order Number: #{{order_id}}
- Order Date: {{order_date}}
- Total Amount: ₹{{order_total}}
- Payment Method: {{payment_method}}
- Shipping Address: {{shipping_address}}

Track your order: {{website_url}}/orders/{{order_id}}

Questions? Contact us at {{support_email}}

Thank you for choosing Nuvante!

© {{current_year}} Nuvante. All rights reserved.`,
    variables: ['customer_name', 'order_id', 'order_date', 'order_total', 'payment_method', 'shipping_address', 'support_email', 'current_year', 'website_url'],
    isActive: true
  },
  {
    name: 'order_shipped',
    subject: '📦 Your Order #{{order_id}} is On Its Way!',
    templateType: 'order_shipped',
    htmlContent: getEmailBase(`
      <h2>📦 Your Order is Shipped!</h2>
      <p>Great news {{customer_name}}!</p>
      <p>Your order has been carefully packed and is now on its way to you.</p>
      
      <div class="highlight-box">
        <p><strong>📍 Tracking Information</strong></p>
        <p>Tracking Number: <strong>{{tracking_number}}</strong></p>
        <p>Carrier: {{shipping_carrier}}</p>
        <p>Estimated Delivery: 2-3 business days</p>
      </div>

      <div class="order-details">
        <h3>📋 Shipment Details</h3>
        <div class="detail-row">
          <span class="detail-label">Order Number:</span>
          <span class="detail-value">#{{order_id}}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Ship Date:</span>
          <span class="detail-value">{{ship_date}}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Tracking Number:</span>
          <span class="detail-value">{{tracking_number}}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Shipping Carrier:</span>
          <span class="detail-value">{{shipping_carrier}}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Delivery Address:</span>
          <span class="detail-value">{{shipping_address}}</span>
        </div>
      </div>

      <div style="text-align: center;">
        <a href="{{tracking_url}}" class="btn">Track Package</a>
      </div>

      <div class="divider"></div>
      <p><strong>💡 Delivery Tips:</strong></p>
      <p>• Someone should be available to receive the package</p>
      <p>• Keep your tracking number handy</p>
      <p>• Contact us if you have any delivery concerns</p>
    `),
    plainTextContent: `📦 Your Order is Shipped!

Great news {{customer_name}}!

Your order has been carefully packed and is now on its way to you.

Tracking Information:
- Tracking Number: {{tracking_number}}
- Carrier: {{shipping_carrier}}
- Estimated Delivery: 2-3 business days

Shipment Details:
- Order Number: #{{order_id}}
- Ship Date: {{ship_date}}
- Delivery Address: {{shipping_address}}

Track your package: {{tracking_url}}

Questions? Contact us at {{support_email}}

© {{current_year}} Nuvante. All rights reserved.`,
    variables: ['customer_name', 'order_id', 'ship_date', 'tracking_number', 'shipping_carrier', 'shipping_address', 'tracking_url', 'support_email', 'current_year'],
    isActive: true
  },
  {
    name: 'welcome',
    subject: '🌟 Welcome to Nuvante, {{customer_name}}!',
    templateType: 'welcome',
    htmlContent: getEmailBase(`
      <h2>🌟 Welcome to the Nuvante Family!</h2>
      <p>Hi {{customer_name}},</p>
      <p>Welcome to Nuvante! We're thrilled to have you join our fashion community.</p>
      
      <div class="highlight-box">
        <p><strong>🎁 Special Welcome Offer</strong></p>
        <p>Get <strong>15% OFF</strong> your first order with code: <strong>WELCOME15</strong></p>
        <p>Valid for the next 7 days!</p>
      </div>

      <div class="order-details">
        <h3>🚀 Get Started</h3>
        <div style="padding: 10px 0;">
          <p>🛍️ <strong>Browse Collections:</strong> Discover our latest fashion trends</p>
          <p>👤 <strong>Complete Profile:</strong> Get personalized recommendations</p>
          <p>💌 <strong>Follow Us:</strong> Stay updated with exclusive deals</p>
          <p>📱 <strong>Download App:</strong> Shop on the go</p>
        </div>
      </div>

      <div style="text-align: center;">
        <a href="{{website_url}}" class="btn">Start Shopping</a>
      </div>

      <div class="divider"></div>
      <p>Questions? We're here to help! Contact us at {{support_email}}</p>
      <p>Happy shopping! 💜</p>
    `),
    plainTextContent: `🌟 Welcome to the Nuvante Family!

Hi {{customer_name}},

Welcome to Nuvante! We're thrilled to have you join our fashion community.

🎁 Special Welcome Offer
Get 15% OFF your first order with code: WELCOME15
Valid for the next 7 days!

🚀 Get Started:
🛍️ Browse Collections: Discover our latest fashion trends
👤 Complete Profile: Get personalized recommendations  
💌 Follow Us: Stay updated with exclusive deals
📱 Download App: Shop on the go

Start shopping: {{website_url}}

Questions? Contact us at {{support_email}}

Happy shopping! 💜

© {{current_year}} Nuvante. All rights reserved.`,
    variables: ['customer_name', 'website_url', 'support_email', 'current_year'],
    isActive: true
  },
  {
    name: 'password_reset',
    subject: '🔐 Reset Your Nuvante Password',
    templateType: 'password_reset',
    htmlContent: getEmailBase(`
      <h2>🔐 Password Reset Request</h2>
      <p>Hi {{customer_name}},</p>
      <p>We received a request to reset your Nuvante account password.</p>
      
      <div class="highlight-box">
        <p><strong>🔒 Security Information</strong></p>
        <p>If you didn't request this password reset, please ignore this email.</p>
        <p>This link will expire in 1 hour for your security.</p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="{{reset_url}}" class="btn">Reset Password</a>
      </div>

      <div class="divider"></div>
      <p><strong>Can't click the button?</strong> Copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #666;">{{reset_url}}</p>
      
      <p>If you have any questions, contact us at {{support_email}}</p>
    `),
    plainTextContent: `🔐 Password Reset Request

Hi {{customer_name}},

We received a request to reset your Nuvante account password.

If you didn't request this password reset, please ignore this email.
This link will expire in 1 hour for your security.

Reset your password: {{reset_url}}

If you have any questions, contact us at {{support_email}}

© {{current_year}} Nuvante. All rights reserved.`,
    variables: ['customer_name', 'reset_url', 'support_email', 'current_year'],
    isActive: true
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

    // Clear existing templates
    await EmailTemplate.deleteMany({});

    // Insert new professional templates
    const createdTemplates = await EmailTemplate.insertMany(templates);

    return NextResponse.json({
      success: true,
      message: '✨ Professional email templates with logos seeded successfully!',
      count: createdTemplates.length,
      templates: createdTemplates.map(t => ({
        id: t._id,
        name: t.name,
        subject: t.subject,
        templateType: t.templateType,
        variables: t.variables
      }))
    });

  } catch (error: any) {
    console.error('Error seeding templates:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
} 