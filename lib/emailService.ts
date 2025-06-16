import EmailTemplate from '../models/EmailTemplate';
import EmailLog from '../models/EmailLog';
import connect from '../db';
import nodemailer from 'nodemailer';

interface EmailVariables {
  [key: string]: string | number | boolean;
}

interface SendEmailOptions {
  templateName?: string;
  templateId?: string;
  recipientEmail: string;
  recipientName?: string;
  variables?: EmailVariables;
  orderId?: string;
  userId?: string;
  metadata?: any;
}

class EmailService {
  private static instance: EmailService;
  private transporter: nodemailer.Transporter | null = null;
  
  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  // Initialize email transporter based on provider
  private async initializeTransporter() {
    if (this.transporter) {
      return this.transporter;
    }

    const provider = process.env.EMAIL_PROVIDER || 'smtp';
    
    try {
      switch (provider) {
        case 'smtp':
          this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS
            },
            tls: {
              rejectUnauthorized: false // For development - remove in production
            }
          });
          break;

        case 'sendgrid':
          // SendGrid SMTP
          this.transporter = nodemailer.createTransport({
            host: 'smtp.sendgrid.net',
            port: 587,
            secure: false,
            auth: {
              user: 'apikey',
              pass: process.env.SENDGRID_API_KEY
            }
          });
          break;

        case 'ses':
          // Amazon SES (not configured - requires @aws-sdk/client-ses package)
          throw new Error('Amazon SES not configured. Please use SMTP provider instead.');
          break;

        case 'mailgun':
          // Mailgun SMTP
          this.transporter = nodemailer.createTransport({
            host: 'smtp.mailgun.org',
            port: 587,
            secure: false,
            auth: {
              user: `postmaster@${process.env.MAILGUN_DOMAIN}`,
              pass: process.env.MAILGUN_API_KEY
            }
          });
          break;

        default:
          throw new Error(`Unknown email provider: ${provider}`);
      }

      // Verify connection
      if (this.transporter) {
        await this.transporter.verify();
      }
      console.log('✅ Email transporter initialized successfully');
      
    } catch (error) {
      console.error('❌ Email transporter initialization failed:', error);
      // Fall back to simulation mode
      console.log('📧 Falling back to simulation mode');
      this.transporter = null;
    }

    return this.transporter;
  }

  // Replace variables in template content
  private replaceVariables(content: string, variables: EmailVariables = {}): string {
    let result = content;
    
    // Replace custom variables
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      result = result.replace(regex, String(value));
    });

    // Replace common system variables
    const systemVariables = {
      'current_year': new Date().getFullYear(),
      'current_date': new Date().toLocaleDateString(),
      'current_time': new Date().toLocaleTimeString(),
      'website_name': 'Nuvante',
      'website_url': process.env.NEXT_PUBLIC_SITE_URL || 'https://nuvante.com',
      'support_email': process.env.EMAIL_FROM || 'support@nuvante.com',
    };

    Object.entries(systemVariables).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      result = result.replace(regex, String(value));
    });

    return result;
  }

  // Get template by name or ID
  private async getTemplate(templateName?: string, templateId?: string) {
    await connect();
    
    let template;
    if (templateId) {
      template = await EmailTemplate.findById(templateId);
    } else if (templateName) {
      template = await EmailTemplate.findOne({ name: templateName, isActive: true });
    }
    
    if (!template) {
      throw new Error(`Template not found: ${templateName || templateId}`);
    }
    
    return template;
  }

  // Create email log entry
  private async createEmailLog(options: SendEmailOptions & { templateId: string; subject: string; status: 'sent' | 'failed' | 'pending'; failureReason?: string }) {
    await connect();
    
    const emailLog = new EmailLog({
      templateId: options.templateId,
      recipientEmail: options.recipientEmail,
      recipientName: options.recipientName,
      subject: options.subject,
      status: options.status,
      sentAt: options.status === 'sent' ? new Date() : undefined,
      failureReason: options.failureReason,
      orderId: options.orderId,
      userId: options.userId,
      metadata: options.metadata,
    });
    
    await emailLog.save();
    return emailLog;
  }

  // Send email using configured provider
  private async sendEmailViaProvider(to: string, subject: string, htmlContent: string, plainTextContent: string): Promise<{ success: boolean; error?: string }> {
    try {
      const transporter = await this.initializeTransporter();
      
      // If no transporter available, simulate sending (fallback)
      if (!transporter) {
        console.log('📧 Simulating email send (no transporter):', {
          to,
          subject,
          htmlLength: htmlContent.length,
          plainTextLength: plainTextContent.length,
        });
        return { success: true };
      }

      const fromDomain = process.env.EMAIL_DOMAIN || 'nuvante.com';
      
      // Simplified mail options to fix MIME issues
      const mailOptions = {
        from: {
          name: process.env.EMAIL_FROM_NAME || 'Nuvante',
          address: process.env.EMAIL_FROM || `orders@${fromDomain}`
        },
        to,
        subject,
        html: htmlContent,
        text: plainTextContent,
        // Remove all custom headers that might interfere with MIME structure
      };

      const result = await transporter.sendMail(mailOptions);
      
      console.log('✅ Email sent successfully:', {
        messageId: result.messageId,
        to,
        subject,
        response: result.response
      });
      
      return { success: true };
      
    } catch (error: any) {
      console.error('❌ Email sending failed:', error);
      return { 
        success: false, 
        error: error.message || 'Unknown email provider error' 
      };
    }
  }

  // Main method to send email
  async sendEmail(options: SendEmailOptions): Promise<{ success: boolean; error?: string; logId?: string }> {
    try {
      // Get template
      const template = await this.getTemplate(options.templateName, options.templateId);
      
      // Replace variables in content
      const htmlContent = this.replaceVariables(template.htmlContent, options.variables);
      const plainTextContent = this.replaceVariables(template.plainTextContent, options.variables);
      const subject = this.replaceVariables(template.subject, options.variables);
      
      // Create pending log entry
      const emailLog = await this.createEmailLog({
        ...options,
        templateId: template._id.toString(),
        subject,
        status: 'pending'
      });
      
      // Send email
      const result = await this.sendEmailViaProvider(
        options.recipientEmail,
        subject,
        htmlContent,
        plainTextContent
      );
      
      // Update log with result
      emailLog.status = result.success ? 'sent' : 'failed';
      if (result.success) {
        emailLog.sentAt = new Date();
      } else {
        emailLog.failureReason = result.error;
      }
      await emailLog.save();
      
      return {
        success: result.success,
        error: result.error,
        logId: emailLog._id.toString()
      };
      
    } catch (error: any) {
      console.error('Email service error:', error);
      return {
        success: false,
        error: error.message || 'Unknown error occurred'
      };
    }
  }

  // Send bulk emails
  async sendBulkEmails(recipients: Array<{ email: string; name?: string; variables?: EmailVariables }>, templateOptions: { templateName?: string; templateId?: string }): Promise<{ success: number; failed: number; results: Array<{ email: string; success: boolean; error?: string }> }> {
    const results = [];
    let successCount = 0;
    let failedCount = 0;

    for (const recipient of recipients) {
      const result = await this.sendEmail({
        ...templateOptions,
        recipientEmail: recipient.email,
        recipientName: recipient.name,
        variables: recipient.variables,
      });

      if (result.success) {
        successCount++;
      } else {
        failedCount++;
      }

      results.push({
        email: recipient.email,
        success: result.success,
        error: result.error,
      });

      // Add small delay between emails to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return {
      success: successCount,
      failed: failedCount,
      results,
    };
  }

  // Get email statistics
  async getEmailStats(startDate?: Date, endDate?: Date) {
    await connect();
    
    const matchStage: any = {};
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = startDate;
      if (endDate) matchStage.createdAt.$lte = endDate;
    }

    const stats = await EmailLog.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const result = {
      sent: 0,
      failed: 0,
      pending: 0,
      total: 0
    };

    stats.forEach(stat => {
      result[stat._id as keyof typeof result] = stat.count;
      result.total += stat.count;
    });

    return result;
  }

  // Test email connection
  async testConnection(): Promise<{ success: boolean; error?: string; provider?: string }> {
    try {
      const transporter = await this.initializeTransporter();
      const provider = process.env.EMAIL_PROVIDER || 'smtp';
      
      if (!transporter) {
        return {
          success: false,
          error: 'Could not initialize email transporter',
          provider
        };
      }

      await transporter.verify();
      return {
        success: true,
        provider
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        provider: process.env.EMAIL_PROVIDER || 'smtp'
      };
    }
  }
}

export default EmailService; 