import { NextRequest, NextResponse } from 'next/server';
import EmailAutomation from '../../../../lib/emailAutomation';

// POST - Handle order success webhook
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      success, 
      orderId, 
      customerEmail, 
      customerName,
      orderTotal,
      orderItems,
      shippingAddress,
      paymentMethod,
      userId
    } = body;

    // Validate required fields
    if (!success || !orderId || !customerEmail) {
      return NextResponse.json({
        success: false,
        error: "❌ Order validation failed",
        message: "Invalid order data. Please ensure success=true, orderId exists, and customer email is provided.",
        requiredFields: {
          success: "Must be true",
          orderId: "Must not be empty",
          customerEmail: "Must not be empty"
        },
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    // Trigger email automation
    const emailAutomation = EmailAutomation.getInstance();
    const emailResult = await emailAutomation.sendOrderConfirmation({
      orderId,
      customerEmail,
      customerName,
      orderTotal,
      orderItems,
      shippingAddress,
      paymentMethod,
      userId
    });

    console.log('📧 Order confirmation email result:', emailResult);

    return NextResponse.json({
      success: true,
      message: "✅ Order email automation completed successfully!",
      orderId,
      customerEmail,
      timestamp: new Date().toISOString(),
      webhookUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/order-success`,
      emailSent: emailResult.success,
      emailError: emailResult.error || null,
      logId: emailResult.logId || null
    });
    
  } catch (error: any) {
    console.error('Order success webhook error:', error);
    return NextResponse.json({
      success: false,
      error: "❌ Internal server error",
      message: "An error occurred while processing the order success webhook.",
      details: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// GET - Webhook info (for testing)
export async function GET(request: NextRequest) {
  return NextResponse.json({
    webhook: "Order Success Automation",
    description: "Internal email automation for order confirmations",
    endpoint: `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/order-success`,
    method: "POST",
    requiredFields: {
      success: "boolean (must be true)",
      orderId: "string (order identifier)",
      customerEmail: "string (customer email address)"
    },
    optionalFields: {
      customerName: "string (customer full name)",
      orderTotal: "string (order total with currency)",
      orderItems: "array (order items details)",
      shippingAddress: "string (shipping address)",
      paymentMethod: "string (payment method used)",
      userId: "string (user identifier)"
    },
    example: {
      success: true,
      orderId: "ORD-123456",
      customerEmail: "customer@example.com",
      customerName: "John Doe",
      orderTotal: "$99.99",
      orderItems: [
        { name: "Product A", quantity: 2, price: "$50.00" },
        { name: "Product B", quantity: 1, price: "$49.99" }
      ],
      shippingAddress: "123 Main St, City, State 12345",
      paymentMethod: "Credit Card",
      userId: "user_123"
    },
    timestamp: new Date().toISOString()
  });
} 