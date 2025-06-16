import { NextRequest, NextResponse } from 'next/server';
import EmailAutomation from '../../../lib/emailAutomation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.orderId || !body.customerEmail) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: orderId and customerEmail are required'
      }, { status: 400 });
    }

    console.log('📧 Processing order confirmation email for:', {
      orderId: body.orderId,
      customerEmail: body.customerEmail,
      customerName: body.customerName
    });

    // Prepare email variables
    const emailVariables = {
      // Customer details
      customer_name: body.customerName || 'Valued Customer',
      customer_email: body.customerEmail,
      
      // Order details
      order_id: body.orderId,
      total_amount: body.orderTotal || 'Amount not specified',
      payment_method: body.paymentMethod || 'Online Payment',
      
      // Order items
      order_items: body.orderItems || 'Order items not specified',
      order_items_count: body.products?.length || 0,
      
      // Shipping address
      shipping_address: body.shippingAddress || 'Shipping address not provided',
      
      // Additional details
      order_date: new Date().toLocaleDateString('en-IN'),
      order_time: new Date().toLocaleTimeString('en-IN'),
      estimated_delivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN'),
      
      // Enhanced product details
      items_list: JSON.stringify(body.products || []),
      order_metadata: JSON.stringify({
        orderId: body.orderId,
        timestamp: new Date().toISOString(),
        source: 'direct_integration',
        itemCount: body.products?.length || 0
      })
    };

    // Send order confirmation email
    const emailAutomation = new EmailAutomation();
    const emailResult = await emailAutomation.sendOrderConfirmation(
      body.customerEmail,
      body.customerName || 'Valued Customer',
      emailVariables,
      body.orderId
    );

    // Return response
    return NextResponse.json({
      success: emailResult.success,
      message: emailResult.success ? '✅ Order confirmation email sent successfully!' : '❌ Order confirmation email failed',
      orderId: body.orderId,
      customerEmail: body.customerEmail,
      timestamp: new Date().toISOString(),
      emailError: emailResult.error || null,
      logId: (emailResult as any).logId || null
    });

  } catch (error: any) {
    console.error('❌ Send order email error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error.message || 'Unknown error occurred',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// GET - API info
export async function GET() {
  return NextResponse.json({
    endpoint: 'Send Order Email',
    description: 'Internal API for sending order confirmation emails directly from checkout',
    method: 'POST',
    requiredFields: {
      orderId: 'string (order identifier)',
      customerEmail: 'string (customer email address)'
    },
    optionalFields: {
      customerName: 'string (customer full name)',
      orderTotal: 'string (order total with currency)',
      orderItems: 'string (formatted order items)',
      shippingAddress: 'string (formatted shipping address)',
      paymentMethod: 'string (payment method used)',
      products: 'array (product details)'
    },
    integration: 'Directly integrated into app/CheckOut/page.tsx',
    timestamp: new Date().toISOString()
  });
} 