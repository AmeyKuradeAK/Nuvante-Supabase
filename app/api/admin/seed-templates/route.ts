import { NextRequest, NextResponse } from 'next/server';
import connect from '../../../../db';
import EmailTemplate from '../../../../models/EmailTemplate';

// STUNNING web-page quality email template
const getStunningTemplate = (content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{subject}}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }
        .email-wrapper { 
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            padding: 20px; 
            min-height: 100vh;
        }
        .email-container { 
            max-width: 650px; 
            margin: 0 auto; 
            background: white; 
            border-radius: 20px; 
            overflow: hidden; 
            box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }
        .email-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 6px;
            background: linear-gradient(90deg, #667eea, #764ba2, #f093fb, #f5576c);
        }
        .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 40px 30px; 
            text-align: center; 
            position: relative;
        }
        .logo { 
            max-width: 200px; 
            height: auto; 
            margin-bottom: 20px; 
            filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
        }
        .header h1 { 
            font-size: 32px; 
            font-weight: 700; 
            margin: 0; 
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        .header p {
            font-size: 16px;
            opacity: 0.9;
            margin-top: 10px;
        }
        .content { 
            padding: 40px 30px; 
            background: white;
        }
        .content h2 { 
            color: #2c3e50; 
            font-size: 28px; 
            margin-bottom: 25px; 
            text-align: center;
        }
        .content p { 
            margin-bottom: 18px; 
            color: #555; 
            font-size: 16px;
            line-height: 1.7;
        }
        .highlight-box { 
            background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
            border: 2px solid #667eea30;
            border-radius: 15px;
            padding: 25px; 
            margin: 25px 0; 
        }
        .order-details { 
            background: white;
            border: 2px solid #e9ecef; 
            border-radius: 15px; 
            padding: 25px; 
            margin: 25px 0; 
            box-shadow: 0 8px 16px rgba(0,0,0,0.08);
        }
        .order-details h3 { 
            color: #2c3e50; 
            margin-bottom: 20px; 
            font-size: 22px;
        }
        .detail-row { 
            display: flex; 
            justify-content: space-between; 
            padding: 12px 0; 
            border-bottom: 1px solid #f1f3f4; 
        }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { 
            font-weight: 600; 
            color: #555; 
        }
        .detail-value { 
            color: #333; 
            font-weight: 500;
        }
        .product-card {
            background: white;
            border: 2px solid #e9ecef;
            border-radius: 15px;
            padding: 20px;
            margin: 20px 0;
            display: flex;
            align-items: center;
            box-shadow: 0 8px 16px rgba(0,0,0,0.08);
        }
        .product-image {
            width: 80px;
            height: 80px;
            object-fit: cover;
            border-radius: 12px;
            margin-right: 20px;
        }
        .product-info {
            flex: 1;
        }
        .product-name {
            font-weight: 600;
            color: #2c3e50;
            font-size: 16px;
            margin-bottom: 5px;
        }
        .product-details {
            color: #666;
            font-size: 14px;
            margin-bottom: 8px;
        }
        .product-price {
            font-weight: 700;
            color: #667eea;
            font-size: 16px;
        }
        .btn { 
            display: inline-block; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 16px 32px; 
            text-decoration: none; 
            border-radius: 50px; 
            font-weight: 600; 
            margin: 25px 0;
            text-align: center;
            font-size: 16px;
            box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
        }
        .footer { 
            background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
            color: #bdc3c7; 
            padding: 40px 30px; 
            text-align: center; 
            font-size: 14px; 
        }
        .footer a { 
            color: #3498db; 
            text-decoration: none; 
        }
        .success-badge {
            background: linear-gradient(135deg, #27ae60, #2ecc71);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            display: inline-block;
            margin-bottom: 20px;
        }
        @media (max-width: 600px) { 
            .email-container { 
                margin: 0; 
                border-radius: 0; 
            }
            .content { padding: 25px 20px; }
            .header { padding: 30px 20px; }
            .product-card {
                flex-direction: column;
                text-align: center;
            }
            .product-image {
                margin-right: 0;
                margin-bottom: 15px;
            }
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="email-container">
            <div class="header">
                <img src="https://nuvante.in/logo-white.png" alt="Nuvante Logo" class="logo">
                <h1>Nuvante</h1>
                <p>Fashion That Speaks Your Style</p>
            </div>
            <div class="content">
                ${content}
            </div>
            <div class="footer">
                <p><strong>Nuvante - Premium Fashion</strong></p>
                <p>📧 <a href="mailto:support@nuvante.in">support@nuvante.in</a> | 🌐 <a href="https://nuvante.in">nuvante.in</a></p>
                <p>&copy; {{current_year}} Nuvante. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>
`;

const stunningTemplates = [
  {
    name: 'order_confirmation',
    subject: '🎉 Order Confirmed #{{order_id}} - Thank You {{customer_name}}!',
    templateType: 'order_confirmation',
    htmlContent: getStunningTemplate(`
      <div class="success-badge">✅ Order Confirmed</div>
      <h2>🎉 Your Order is Confirmed!</h2>
      <p>Hi <strong>{{customer_name}}</strong>,</p>
      <p>Thank you for your amazing order! We're thrilled to prepare your stunning fashion items for you. ✨</p>
      
      <div class="highlight-box">
        <h3 style="margin-bottom: 15px; color: #667eea;">🚀 What happens next?</h3>
        <p>✅ <strong>Order Processing:</strong> We'll start preparing your items immediately</p>
        <p>📦 <strong>Shipping Updates:</strong> You'll receive tracking info once shipped</p>
        <p>🚚 <strong>Delivery:</strong> Expected in 3-5 business days</p>
      </div>

      <div class="order-details">
        <h3>🛍️ Your Amazing Order</h3>
        
        {{product_cards_html}}
        
        <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 10px;">
          <div class="detail-row" style="border-top: 2px solid #667eea; padding-top: 15px;">
            <span class="detail-label" style="font-size: 18px;"><strong>Total Amount:</strong></span>
            <span class="detail-value" style="font-size: 20px; color: #667eea; font-weight: 700;">₹{{order_total}}</span>
          </div>
        </div>
      </div>

      <div class="order-details">
        <h3>📋 Order Details</h3>
        <div class="detail-row">
          <span class="detail-label">Order Number:</span>
          <span class="detail-value"><strong>#{{order_id}}</strong></span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Order Date:</span>
          <span class="detail-value">{{order_date}}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Payment Method:</span>
          <span class="detail-value">{{payment_method}}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Delivery Address:</span>
          <span class="detail-value">{{shipping_address}}</span>
        </div>
      </div>

      <div style="text-align: center;">
        <a href="{{website_url}}/orders/{{order_id}}" class="btn">🔍 Track Your Order</a>
      </div>

      <p style="text-align: center; font-size: 18px; color: #667eea; font-weight: 600;">
        Thank you for choosing Nuvante! 💜✨
      </p>
    `),
    plainTextContent: `🎉 Your Order is Confirmed!

Hi {{customer_name}},

Thank you for your order! 

Order Details:
- Order Number: #{{order_id}}
- Order Date: {{order_date}}
- Total Amount: ₹{{order_total}}
- Payment Method: {{payment_method}}
- Shipping Address: {{shipping_address}}

Track: {{website_url}}/orders/{{order_id}}

© {{current_year}} Nuvante. All rights reserved.`,
    variables: [
      { name: 'customer_name', description: 'Customer full name', example: 'John Doe' },
      { name: 'order_id', description: 'Order ID/number', example: 'ORD-12345' },
      { name: 'order_date', description: 'Date when order was placed', example: '15/12/2024' },
      { name: 'order_total', description: 'Total order amount', example: '2999' },
      { name: 'order_subtotal', description: 'Subtotal before shipping', example: '2949' },
      { name: 'shipping_cost', description: 'Shipping charges', example: '50' },
      { name: 'payment_method', description: 'Payment method used', example: 'Online Payment' },
      { name: 'shipping_address', description: 'Delivery address', example: '123 Street, City' },
      { name: 'customer_phone', description: 'Customer phone number', example: '+91 9876543210' },
      { name: 'tracking_number', description: 'Shipment tracking number', example: 'TRK123456' },
      { name: 'shipping_carrier', description: 'Shipping company', example: 'BlueDart' },
      { name: 'product_name', description: 'Primary product name', example: 'Cotton Shirt' },
      { name: 'product_size', description: 'Product size', example: 'M' },
      { name: 'product_qty', description: 'Product quantity', example: '2' },
      { name: 'product_price', description: 'Product price', example: '1499' },
      { name: 'product_cards_html', description: 'HTML for product cards', example: '<div>Product cards</div>' },
      { name: 'order_items_text', description: 'Plain text product list', example: '- Cotton Shirt (Size: M, Qty: 2) - ₹1499' },
      { name: 'website_url', description: 'Website URL', example: 'https://nuvante.in' },
      { name: 'support_email', description: 'Support email', example: 'support@nuvante.in' },
      { name: 'current_year', description: 'Current year', example: '2024' }
    ],
    createdBy: 'system',
    lastEditedBy: 'system',
    isActive: true
  },
  {
    name: 'welcome',
    subject: '🌟 Welcome to Nuvante, {{customer_name}}!',
    templateType: 'welcome',
    htmlContent: getStunningTemplate(`
      <div class="success-badge">🎉 Welcome Aboard!</div>
      <h2>🌟 Welcome to Nuvante!</h2>
      <p>Hi <strong>{{customer_name}}</strong>,</p>
      <p>Welcome to <strong>Nuvante</strong>! We're thrilled to have you join our fashion community. ✨</p>
      
      <div class="highlight-box">
        <h3 style="margin-bottom: 15px; color: #667eea;">🎉 Welcome to Premium Fashion!</h3>
        <p>✨ <strong>Discover Latest Trends:</strong> Browse our exclusive collection</p>
        <p>🚚 <strong>Free Shipping:</strong> On orders above ₹999</p>
        <p>💝 <strong>Quality Guarantee:</strong> Premium fashion, always</p>
        <p>🔔 <strong>Stay Updated:</strong> Be first to know about new arrivals</p>
      </div>

      <div style="text-align: center;">
        <a href="{{website_url}}" class="btn">🛒 Start Shopping Now</a>
      </div>

      <p style="text-align: center; font-size: 18px; color: #667eea; font-weight: 600;">
        Happy shopping! 💜✨
      </p>
    `),
    plainTextContent: `🌟 Welcome to Nuvante!

Hi {{customer_name}},

Welcome to premium fashion! 

✨ Discover Latest Trends
🚚 Free Shipping on orders above ₹999
💝 Quality Guarantee

Start shopping: {{website_url}}

© {{current_year}} Nuvante. All rights reserved.`,
    variables: [
      { name: 'customer_name', description: 'Customer full name', example: 'John Doe' },
      { name: 'website_url', description: 'Website URL', example: 'https://nuvante.in' },
      { name: 'current_year', description: 'Current year', example: '2024' }
    ],
    createdBy: 'system',
    lastEditedBy: 'system',
    isActive: true
  }
];

export async function POST(request: NextRequest) {
  try {
    await connect();

    // Clear and insert stunning templates
    await EmailTemplate.deleteMany({});
    const createdTemplates = await EmailTemplate.insertMany(stunningTemplates);

    return NextResponse.json({
      success: true,
      message: '🎨 STUNNING web-page quality templates loaded!',
      count: createdTemplates.length,
      templates: createdTemplates.map(t => ({
        id: t._id,
        name: t.name,
        subject: t.subject,
        templateType: t.templateType
      }))
    });

  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
} 