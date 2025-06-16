import { NextRequest, NextResponse } from 'next/server';
import EmailService from '../../../../lib/emailService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📧 Order success webhook received:', body);

    // Validate required fields
    if (!body.success || !body.orderId || !body.customerEmail) {
      return NextResponse.json(
        {
          success: false,
          error: '❌ Missing required fields',
          message: 'Required: success=true, orderId, and customerEmail',
          received: body
        },
        { status: 400 }
      );
    }

    // Extract comprehensive order and customer data
    const {
      orderId,
      customerEmail,
      customerName = 'Valued Customer',
      orderDate = new Date().toLocaleDateString('en-IN'),
      orderTotal = '0',
      paymentMethod = 'Online Payment',
      shippingAddress = '',
      customerPhone = '',
      orderItems = [],
      trackingNumber = '',
      shippingCarrier = 'Standard Delivery'
    } = body;

    // Prepare variables for email template
    const emailVariables = {
      customer_name: customerName,
      order_id: orderId,
      order_date: orderDate,
      order_total: orderTotal,
      payment_method: paymentMethod,
      shipping_address: shippingAddress,
      customer_phone: customerPhone,
      tracking_number: trackingNumber,
      shipping_carrier: shippingCarrier,
      website_url: process.env.NEXT_PUBLIC_SITE_URL || 'https://nuvante.com',
      support_email: process.env.EMAIL_FROM || 'support@nuvante.in',
      current_year: new Date().getFullYear().toString(),
    };

    console.log('📧 Sending order confirmation email with variables:', emailVariables);

    // Send order confirmation email
    const emailService = EmailService.getInstance();
    const emailResult = await emailService.sendEmail({
      templateName: 'order_confirmation',
      recipientEmail: customerEmail,
      recipientName: customerName,
      variables: emailVariables,
      orderId: orderId,
      metadata: {
        webhook: 'order-success',
        timestamp: new Date().toISOString(),
        orderData: body
      }
    });

    if (emailResult.success) {
      console.log('✅ Order confirmation email sent successfully');
      return NextResponse.json({
        success: true,
        message: '✅ Order confirmation email sent successfully!',
        orderId,
        customerEmail,
        emailLogId: emailResult.logId,
        timestamp: new Date().toISOString()
      });
    } else {
      console.error('❌ Failed to send order confirmation email:', emailResult.error);
      return NextResponse.json({
        success: false,
        error: '❌ Failed to send email',
        details: emailResult.error,
        orderId,
        customerEmail
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('❌ Order success webhook error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '❌ Webhook processing failed',
        message: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 