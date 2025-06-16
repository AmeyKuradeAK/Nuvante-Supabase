import EmailService from './emailService';

interface AutomationTriggerOptions {
  event: 'order_confirmation' | 'order_shipped' | 'order_delivered' | 'welcome' | 'password_reset';
  recipientEmail: string;
  recipientName?: string;
  variables?: Record<string, any>;
  orderId?: string;
  userId?: string;
  metadata?: any;
}

class EmailAutomation {
  private static instance: EmailAutomation;
  private emailService: EmailService;
  
  private constructor() {
    this.emailService = EmailService.getInstance();
  }
  
  static getInstance(): EmailAutomation {
    if (!EmailAutomation.instance) {
      EmailAutomation.instance = new EmailAutomation();
    }
    return EmailAutomation.instance;
  }

  // Main automation trigger method
  async trigger(options: AutomationTriggerOptions): Promise<{ success: boolean; error?: string; logId?: string }> {
    try {
      console.log(`🤖 Email automation triggered for: ${options.event}`);
      
      // Map events to template names
      const templateMap: Record<string, string> = {
        'order_confirmation': 'Order Confirmation',
        'order_shipped': 'Order Shipped',
        'order_delivered': 'Order Delivered',
        'welcome': 'Welcome Email',
        'password_reset': 'Password Reset'
      };

      const templateName = templateMap[options.event];
      if (!templateName) {
        throw new Error(`No template mapping found for event: ${options.event}`);
      }

      // Send email using the service
      const result = await this.emailService.sendEmail({
        templateName,
        recipientEmail: options.recipientEmail,
        recipientName: options.recipientName,
        variables: options.variables,
        orderId: options.orderId,
        userId: options.userId,
        metadata: {
          ...options.metadata,
          automationEvent: options.event,
          triggeredAt: new Date().toISOString()
        }
      });

      console.log(`📧 Email automation result for ${options.event}:`, result);
      return result;
      
    } catch (error: any) {
      console.error('Email automation error:', error);
      return {
        success: false,
        error: error.message || 'Unknown automation error'
      };
    }
  }

  // Specific automation methods for common events
  async sendOrderConfirmation(orderData: {
    orderId: string;
    customerEmail: string;
    customerName?: string;
    orderTotal?: string;
    orderItems?: Array<{ name: string; quantity: number; price: string }>;
    shippingAddress?: string;
    paymentMethod?: string;
    userId?: string;
  }): Promise<{ success: boolean; error?: string; logId?: string }> {
    return this.trigger({
      event: 'order_confirmation',
      recipientEmail: orderData.customerEmail,
      recipientName: orderData.customerName,
      orderId: orderData.orderId,
      userId: orderData.userId,
      variables: {
        customer_name: orderData.customerName || 'Valued Customer',
        order_id: orderData.orderId,
        total_amount: orderData.orderTotal || 'N/A',
        order_items: orderData.orderItems?.map(item => 
          `${item.name} (Qty: ${item.quantity}) - ${item.price}`
        ).join('\n') || 'Order details processing...',
        shipping_address: orderData.shippingAddress || 'Address on file',
        payment_method: orderData.paymentMethod || 'Payment processed'
      },
      metadata: {
        orderValue: orderData.orderTotal,
        itemCount: orderData.orderItems?.length || 0
      }
    });
  }

  async sendWelcomeEmail(userData: {
    email: string;
    name?: string;
    userId?: string;
  }): Promise<{ success: boolean; error?: string; logId?: string }> {
    return this.trigger({
      event: 'welcome',
      recipientEmail: userData.email,
      recipientName: userData.name,
      userId: userData.userId,
      variables: {
        customer_name: userData.name || 'New User',
        welcome_message: 'Welcome to Nuvante! We\'re excited to have you on board.',
        getting_started_url: `${process.env.NEXT_PUBLIC_SITE_URL}/welcome`
      }
    });
  }

  async sendPasswordResetEmail(userData: {
    email: string;
    name?: string;
    resetToken: string;
    userId?: string;
  }): Promise<{ success: boolean; error?: string; logId?: string }> {
    return this.trigger({
      event: 'password_reset',
      recipientEmail: userData.email,
      recipientName: userData.name,
      userId: userData.userId,
      variables: {
        customer_name: userData.name || 'User',
        reset_link: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password?token=${userData.resetToken}`,
        reset_token: userData.resetToken,
        expiry_time: '24 hours'
      }
    });
  }

  async sendOrderShippedEmail(orderData: {
    orderId: string;
    customerEmail: string;
    customerName?: string;
    trackingNumber?: string;
    carrierName?: string;
    estimatedDelivery?: string;
    userId?: string;
  }): Promise<{ success: boolean; error?: string; logId?: string }> {
    return this.trigger({
      event: 'order_shipped',
      recipientEmail: orderData.customerEmail,
      recipientName: orderData.customerName,
      orderId: orderData.orderId,
      userId: orderData.userId,
      variables: {
        customer_name: orderData.customerName || 'Valued Customer',
        order_id: orderData.orderId,
        tracking_number: orderData.trackingNumber || 'Tracking info will be available soon',
        carrier_name: orderData.carrierName || 'Our shipping partner',
        estimated_delivery: orderData.estimatedDelivery || '3-5 business days',
        tracking_url: orderData.trackingNumber ? 
          `https://track.example.com/${orderData.trackingNumber}` : '#'
      }
    });
  }

  async sendOrderDeliveredEmail(orderData: {
    orderId: string;
    customerEmail: string;
    customerName?: string;
    deliveredAt?: string;
    userId?: string;
  }): Promise<{ success: boolean; error?: string; logId?: string }> {
    return this.trigger({
      event: 'order_delivered',
      recipientEmail: orderData.customerEmail,
      recipientName: orderData.customerName,
      orderId: orderData.orderId,
      userId: orderData.userId,
      variables: {
        customer_name: orderData.customerName || 'Valued Customer',
        order_id: orderData.orderId,
        delivered_at: orderData.deliveredAt || new Date().toLocaleDateString(),
        feedback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/feedback?order=${orderData.orderId}`,
        support_url: `${process.env.NEXT_PUBLIC_SITE_URL}/support`
      }
    });
  }

  // Bulk automation for multiple recipients
  async sendBulkAutomation(
    event: AutomationTriggerOptions['event'],
    recipients: Array<{
      email: string;
      name?: string;
      variables?: Record<string, any>;
      orderId?: string;
      userId?: string;
    }>
  ): Promise<{ success: number; failed: number; results: Array<{ email: string; success: boolean; error?: string }> }> {
    const results = [];
    let successCount = 0;
    let failedCount = 0;

    for (const recipient of recipients) {
      const result = await this.trigger({
        event,
        recipientEmail: recipient.email,
        recipientName: recipient.name,
        variables: recipient.variables,
        orderId: recipient.orderId,
        userId: recipient.userId
      });

      if (result.success) {
        successCount++;
      } else {
        failedCount++;
      }

      results.push({
        email: recipient.email,
        success: result.success,
        error: result.error
      });
    }

    return {
      success: successCount,
      failed: failedCount,
      results
    };
  }
}

export default EmailAutomation; 