import { NextRequest, NextResponse } from 'next/server';
import EmailAutomation from '../../../../lib/emailAutomation';
import connect from '../../../../db';
import Product from '../../../../models/Product';

// Helper function to format order items with product details
async function getOrderItemsWithDetails(itemDetails: Array<{ productId: string; size: string; quantity: number }>) {
  if (!itemDetails || itemDetails.length === 0) {
    return {
      formattedItems: 'Order details are being processed.',
      itemsList: []
    };
  }

  try {
    await connect();
    
    const itemsList = [];
    let formattedItems = '';

    for (const item of itemDetails) {
      try {
        const product = await Product.findById(item.productId);
        
        if (product) {
          const itemTotal = (parseFloat(product.productPrice.replace(/[^0-9.]/g, '')) * item.quantity);
          
          itemsList.push({
            productId: item.productId,
            name: product.productName,
            size: item.size,
            quantity: item.quantity,
            price: product.productPrice,
            total: `₹${itemTotal.toFixed(2)}`,
            image: product.thumbnail,
            type: product.type
          });

          formattedItems += `• ${product.productName}\n`;
          formattedItems += `  Size: ${item.size} | Qty: ${item.quantity} | Price: ${product.productPrice}\n`;
          formattedItems += `  Subtotal: ₹${itemTotal.toFixed(2)}\n\n`;
        } else {
          // Fallback for missing products
          itemsList.push({
            productId: item.productId,
            name: `Product ID: ${item.productId}`,
            size: item.size,
            quantity: item.quantity,
            price: 'Price not available',
            total: 'Total not available'
          });

          formattedItems += `• Product ID: ${item.productId}\n`;
          formattedItems += `  Size: ${item.size} | Qty: ${item.quantity}\n\n`;
        }
      } catch (productError) {
        console.error(`Error fetching product ${item.productId}:`, productError);
        
        // Fallback for error cases
        itemsList.push({
          productId: item.productId,
          name: `Product ID: ${item.productId}`,
          size: item.size,
          quantity: item.quantity,
          price: 'Price not available',
          total: 'Total not available'
        });

        formattedItems += `• Product ID: ${item.productId}\n`;
        formattedItems += `  Size: ${item.size} | Qty: ${item.quantity}\n\n`;
      }
    }

    return { formattedItems: formattedItems.trim(), itemsList };
  } catch (error) {
    console.error('Error formatting order items:', error);
    return {
      formattedItems: 'Order details are being processed.',
      itemsList: []
    };
  }
}

// Helper function to format shipping address
function formatShippingAddress(shippingAddress: any) {
  if (!shippingAddress) {
    return 'Shipping address not provided';
  }

  const parts = [];
  if (shippingAddress.firstName || shippingAddress.lastName) {
    parts.push(`${shippingAddress.firstName || ''} ${shippingAddress.lastName || ''}`.trim());
  }
  if (shippingAddress.streetAddress) parts.push(shippingAddress.streetAddress);
  if (shippingAddress.apartment) parts.push(shippingAddress.apartment);
  if (shippingAddress.city) parts.push(shippingAddress.city);
  if (shippingAddress.pin) parts.push(shippingAddress.pin);
  if (shippingAddress.phone) parts.push(`Phone: ${shippingAddress.phone}`);

  return parts.length > 0 ? parts.join('\n') : 'Shipping address not provided';
}

// POST - Handle order success webhook
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.success || !body.orderId || !body.customerEmail) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
        message: 'success (true), orderId, and customerEmail are required',
        received: {
          success: body.success,
          orderId: body.orderId,
          customerEmail: body.customerEmail
        },
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    // Only proceed if success is true
    if (body.success !== true) {
      return NextResponse.json({
        success: false,
        message: 'Order not successful - no email sent',
        orderId: body.orderId,
        customerEmail: body.customerEmail,
        timestamp: new Date().toISOString()
      });
    }

    console.log('📧 Processing order success email for:', {
      orderId: body.orderId,
      customerEmail: body.customerEmail,
      customerName: body.customerName,
      itemCount: body.itemDetails?.length || 0
    });

    // Get formatted order items with automatic product details
    const { formattedItems, itemsList } = await getOrderItemsWithDetails(body.itemDetails || []);
    
    // Format shipping address
    const formattedShippingAddress = formatShippingAddress(body.shippingAddress);

    // Prepare email variables with enhanced data
    const emailVariables = {
      // Customer details
      customer_name: body.customerName || 'Valued Customer',
      customer_email: body.customerEmail,
      
      // Order details
      order_id: body.orderId,
      total_amount: body.orderTotal || 'Amount being processed',
      payment_method: body.paymentMethod || 'Payment method not specified',
      
      // Enhanced order items
      order_items: formattedItems,
      order_items_count: body.itemDetails?.length || 0,
      
      // Shipping
      shipping_address: formattedShippingAddress,
      
      // Additional metadata
      user_id: body.userId || '',
      order_date: new Date().toLocaleDateString('en-IN'),
      order_time: new Date().toLocaleTimeString('en-IN'),
      estimated_delivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN'),
      
      // Rich data for advanced templates
      items_list: JSON.stringify(itemsList),
      shipping_address_object: JSON.stringify(body.shippingAddress || {}),
      order_metadata: JSON.stringify({
        orderId: body.orderId,
        timestamp: new Date().toISOString(),
        source: 'webhook',
        itemCount: body.itemDetails?.length || 0
      })
    };

    // Send order confirmation email
    const emailAutomation = new EmailAutomation();
    const emailResult = await emailAutomation.sendOrderConfirmation(
      body.customerEmail,
      body.customerName || 'Valued Customer',
      emailVariables,
      body.orderId,
      body.userId
    );

    // Return success response
    return NextResponse.json({
      success: true,
      message: '✅ Order email automation completed successfully!',
      orderId: body.orderId,
      customerEmail: body.customerEmail,
      timestamp: new Date().toISOString(),
      webhookUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/order-success`,
      emailSent: emailResult.success,
      emailError: emailResult.error || null,
      logId: (emailResult as any).logId || null,
      orderDetails: {
        itemsCount: body.itemDetails?.length || 0,
        formattedItems: formattedItems.length,
        shippingAddressProvided: !!body.shippingAddress,
        productsFound: itemsList.filter(item => !item.name.startsWith('Product ID:')).length
      }
    });

  } catch (error: any) {
    console.error('❌ Webhook error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error.message || 'Unknown error occurred',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// GET - Webhook info (for testing)
export async function GET() {
  return NextResponse.json({
    webhook: 'Order Success Automation',
    description: 'Internal email automation for order confirmations with automatic product details',
    endpoint: `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/order-success`,
    method: 'POST',
    requiredFields: {
      success: 'boolean (must be true)',
      orderId: 'string (order identifier)',
      customerEmail: 'string (customer email address)'
    },
    optionalFields: {
      customerName: 'string (customer full name)',
      orderTotal: 'string (order total with currency)',
      itemDetails: 'array (order items with productId, size, quantity)',
      shippingAddress: 'object (shipping address details)',
      paymentMethod: 'string (payment method used)',
      userId: 'string (user identifier)'
    },
    features: [
      'Automatic product detail fetching from database',
      'Professional order item formatting',
      'Smart address formatting',
      'Fallback handling for missing data'
    ],
    example: {
      success: true,
      orderId: 'ORD-123456',
      customerEmail: 'customer@example.com',
      customerName: 'John Doe',
      orderTotal: '₹1,299',
      itemDetails: [
        {
          productId: '60f7b3b4d4e4a24d8c8e4e5a',
          size: 'M',
          quantity: 2
        },
        {
          productId: '60f7b3b4d4e4a24d8c8e4e5b',
          size: 'L',
          quantity: 1
        }
      ],
      shippingAddress: {
        firstName: 'John',
        lastName: 'Doe',
        streetAddress: '123 Main St',
        city: 'Mumbai',
        pin: '400001',
        phone: '+91 9876543210'
      },
      paymentMethod: 'Credit Card',
      userId: 'user_123'
    },
    timestamp: new Date().toISOString()
  });
} 