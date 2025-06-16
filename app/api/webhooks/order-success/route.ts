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
      orderItems = [], // Array of products with details
      trackingNumber = '',
      shippingCarrier = 'Standard Delivery',
      orderSubtotal = '0',
      shippingCost = '50'
    } = body;

    // Process product details for stunning email display
    let productCardHtml = '';
    let productName = 'Your Order';
    let productSize = 'N/A';
    let productQty = '1';
    let productPrice = orderTotal;
    let orderItemsText = '';

    // If we have order items with product details, create stunning product cards
    if (orderItems && orderItems.length > 0) {
      const firstProduct = orderItems[0];
      
      // Extract product details
      productName = firstProduct.name || firstProduct.title || firstProduct.productName || 'Fashion Item';
      productSize = firstProduct.size || firstProduct.selectedSize || 'One Size';
      productQty = firstProduct.quantity || firstProduct.qty || '1';
      productPrice = firstProduct.price || firstProduct.salePrice || (orderTotal / orderItems.length);
      
      // Generate product cards HTML for each item
      productCardHtml = orderItems.map((item: any, index: number) => {
        const itemName = item.name || item.title || item.productName || `Fashion Item ${index + 1}`;
        const itemImage = item.image || item.productImage || item.images?.[0] || 'https://nuvante.com/api/placeholder-product.jpg';
        const itemSize = item.size || item.selectedSize || 'One Size';
        const itemQty = item.quantity || item.qty || '1';
        const itemPrice = item.price || item.salePrice || '999';
        const itemColor = item.color || item.selectedColor || '';
        
        return `
          <div class="product-card">
            <img src="${itemImage}" alt="${itemName}" class="product-image" style="width: 80px; height: 80px; object-fit: cover; border-radius: 12px; margin-right: 20px;">
            <div class="product-info">
              <div class="product-name" style="font-weight: 600; color: #2c3e50; font-size: 16px; margin-bottom: 5px;">${itemName}</div>
              <div class="product-details" style="color: #666; font-size: 14px; margin-bottom: 8px;">
                ${itemColor ? `Color: ${itemColor} | ` : ''}Size: ${itemSize} | Qty: ${itemQty}
              </div>
              <div class="product-price" style="font-weight: 700; color: #667eea; font-size: 16px;">₹${itemPrice}</div>
            </div>
          </div>
        `;
      }).join('');
      
      // Text version for plain text email
      orderItemsText = orderItems.map((item: any) => {
        const itemName = item.name || item.title || item.productName || 'Fashion Item';
        const itemSize = item.size || item.selectedSize || 'One Size';
        const itemQty = item.quantity || item.qty || '1';
        const itemPrice = item.price || item.salePrice || '999';
        return `- ${itemName} (Size: ${itemSize}, Qty: ${itemQty}) - ₹${itemPrice}`;
      }).join('\n');
    } else {
      // Fallback for orders without detailed product info
      productCardHtml = `
        <div class="product-card">
          <img src="https://nuvante.com/api/placeholder-product.jpg" alt="Your Order" class="product-image" style="width: 80px; height: 80px; object-fit: cover; border-radius: 12px; margin-right: 20px;">
          <div class="product-info">
            <div class="product-name" style="font-weight: 600; color: #2c3e50; font-size: 16px; margin-bottom: 5px;">Your Fashion Order</div>
            <div class="product-details" style="color: #666; font-size: 14px; margin-bottom: 8px;">Quantity: 1</div>
            <div class="product-price" style="font-weight: 700; color: #667eea; font-size: 16px;">₹${orderTotal}</div>
          </div>
        </div>
      `;
      orderItemsText = `- Your Fashion Order - ₹${orderTotal}`;
    }

    // Prepare comprehensive variables for the stunning email template
    const emailVariables = {
      customer_name: customerName,
      order_id: orderId,
      order_date: orderDate,
      order_total: orderTotal,
      order_subtotal: orderSubtotal,
      shipping_cost: shippingCost,
      payment_method: paymentMethod,
      shipping_address: shippingAddress,
      customer_phone: customerPhone,
      tracking_number: trackingNumber,
      shipping_carrier: shippingCarrier,
      
      // Product details for template
      product_name: productName,
      product_size: productSize,
      product_qty: productQty,
      product_price: productPrice,
      
      // HTML product cards for stunning display
      product_cards_html: productCardHtml,
      order_items_text: orderItemsText,
      
      // System variables
      website_url: process.env.NEXT_PUBLIC_SITE_URL || 'https://nuvante.com',
      support_email: process.env.EMAIL_FROM || 'support@nuvante.in',
      current_year: new Date().getFullYear().toString(),
    };

    console.log('📧 Sending stunning order confirmation email with product cards:', {
      orderId,
      customerEmail,
      productCount: orderItems?.length || 1,
      hasProductImages: orderItems?.some((item: any) => item.image || item.productImage) || false
    });

    // Send stunning order confirmation email with product cards
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
        orderData: body,
        productCount: orderItems?.length || 1,
        hasProductCards: true
      }
    });

    if (emailResult.success) {
      console.log('✅ Stunning order confirmation email with product cards sent successfully!');
      return NextResponse.json({
        success: true,
        message: '✅ Stunning order confirmation email sent with product cards!',
        orderId,
        customerEmail,
        emailLogId: emailResult.logId,
        productCardsIncluded: true,
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