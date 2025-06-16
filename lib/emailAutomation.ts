import EmailService from './emailService';

interface EmailVariables {
  [key: string]: string | number | boolean;
}

interface OrderConfirmationData {
  orderId: string;
  customerEmail: string;
  customerName?: string;
  orderTotal?: string;
  orderItems?: any;
  shippingAddress?: any;
  paymentMethod?: string;
  userId?: string;
}

class EmailAutomation {
  private emailService: EmailService;

  constructor() {
    this.emailService = EmailService.getInstance();
  }

  // Send order confirmation email with enhanced product details
  async sendOrderConfirmation(
    customerEmail: string,
    customerName: string,
    variables: EmailVariables,
    orderId?: string,
    userId?: string
  ) {
    try {
      const result = await this.emailService.sendEmail({
        templateName: 'Order Confirmation',
        recipientEmail: customerEmail,
        recipientName: customerName,
        variables,
        orderId,
        userId,
        metadata: {
          source: 'webhook',
          emailType: 'order_confirmation',
          timestamp: new Date().toISOString()
        }
      });

      console.log('✅ Order confirmation email sent:', {
        success: result.success,
        email: customerEmail,
        orderId,
        error: result.error
      });

      return result;
    } catch (error: any) {
      console.error('❌ Order confirmation email failed:', error);
      return {
        success: false,
        error: error.message || 'Unknown error'
      };
    }
  }

  // Legacy method for backward compatibility
  async sendOrderConfirmationLegacy(orderData: OrderConfirmationData) {
    console.log('⚠️  Using legacy order confirmation method. Consider updating to new format.');
    
    const variables: EmailVariables = {
      customer_name: orderData.customerName || 'Valued Customer',
      order_id: orderData.orderId,
      total_amount: orderData.orderTotal || 'Amount not specified',
      payment_method: orderData.paymentMethod || 'Payment method not specified',
      shipping_address: typeof orderData.shippingAddress === 'string' 
        ? orderData.shippingAddress 
        : 'Shipping address not provided',
      order_items: Array.isArray(orderData.orderItems)
        ? orderData.orderItems.map(item => `${item.name} (Qty: ${item.quantity}) - ${item.price}`).join('\n')
        : orderData.orderItems || 'Order items not specified'
    };

    return this.sendOrderConfirmation(
      orderData.customerEmail,
      orderData.customerName || 'Valued Customer',
      variables,
      orderData.orderId,
      orderData.userId
    );
  }

  // Send welcome email
  async sendWelcomeEmail(customerEmail: string, customerName: string, variables: EmailVariables = {}) {
    try {
      const welcomeVariables = {
        customer_name: customerName,
        welcome_message: 'Thank you for joining Nuvante! We\'re excited to have you as part of our community.',
        getting_started_url: `${process.env.NEXT_PUBLIC_SITE_URL}/welcome`,
        ...variables
      };

      const result = await this.emailService.sendEmail({
        templateName: 'Welcome Email',
        recipientEmail: customerEmail,
        recipientName: customerName,
        variables: welcomeVariables,
        metadata: {
          emailType: 'welcome',
          timestamp: new Date().toISOString()
        }
      });

      console.log('✅ Welcome email sent:', {
        success: result.success,
        email: customerEmail,
        error: result.error
      });

      return result;
    } catch (error: any) {
      console.error('❌ Welcome email failed:', error);
      return {
        success: false,
        error: error.message || 'Unknown error'
      };
    }
  }

  // Send shipping notification
  async sendShippingNotification(
    customerEmail: string, 
    customerName: string, 
    variables: EmailVariables
  ) {
    try {
      const result = await this.emailService.sendEmail({
        templateName: 'Order Shipped',
        recipientEmail: customerEmail,
        recipientName: customerName,
        variables,
        orderId: variables.order_id as string,
        metadata: {
          emailType: 'shipping_notification',
          timestamp: new Date().toISOString()
        }
      });

      console.log('✅ Shipping notification sent:', {
        success: result.success,
        email: customerEmail,
        orderId: variables.order_id,
        error: result.error
      });

      return result;
    } catch (error: any) {
      console.error('❌ Shipping notification failed:', error);
      return {
        success: false,
        error: error.message || 'Unknown error'
      };
    }
  }

  // Send delivery confirmation
  async sendDeliveryConfirmation(
    customerEmail: string, 
    customerName: string, 
    variables: EmailVariables
  ) {
    try {
      const result = await this.emailService.sendEmail({
        templateName: 'Order Delivered',
        recipientEmail: customerEmail,
        recipientName: customerName,
        variables,
        orderId: variables.order_id as string,
        metadata: {
          emailType: 'delivery_confirmation',
          timestamp: new Date().toISOString()
        }
      });

      console.log('✅ Delivery confirmation sent:', {
        success: result.success,
        email: customerEmail,
        orderId: variables.order_id,
        error: result.error
      });

      return result;
    } catch (error: any) {
      console.error('❌ Delivery confirmation failed:', error);
      return {
        success: false,
        error: error.message || 'Unknown error'
      };
    }
  }

  // Static method for backward compatibility
  static getInstance(): EmailAutomation {
    return new EmailAutomation();
  }
}

export default EmailAutomation; 