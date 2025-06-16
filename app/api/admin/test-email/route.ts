import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connect from '../../../../db';
import AdminEmail from '../../../../models/AdminEmails';
import EmailService from '../../../../lib/emailService';

// Check if user is admin
async function checkAdminStatus(userEmail: string): Promise<boolean> {
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

// POST - Test email configuration and send test email
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

    const body = await request.json();
    const { testEmail, testType = 'connection' } = body;

    const emailService = EmailService.getInstance();

    if (testType === 'connection') {
      // Test just the connection
      const connectionTest = await emailService.testConnection();
      
      return NextResponse.json({
        success: connectionTest.success,
        message: connectionTest.success 
          ? `✅ Email connection successful using ${connectionTest.provider}` 
          : `❌ Email connection failed: ${connectionTest.error}`,
        provider: connectionTest.provider,
        configuration: {
          provider: process.env.EMAIL_PROVIDER || 'smtp',
          host: process.env.SMTP_HOST || 'Not configured',
          port: process.env.SMTP_PORT || 'Not configured',
          user: process.env.SMTP_USER || 'Not configured',
          fromEmail: process.env.EMAIL_FROM || 'Not configured',
          fromName: process.env.EMAIL_FROM_NAME || 'Not configured'
        }
      });
    }

    if (testType === 'send' && testEmail) {
      // Send a test email
      const testResult = await emailService.sendEmail({
        templateName: 'Order Confirmation', // Use existing template or create a simple one
        recipientEmail: testEmail,
        recipientName: 'Test User',
        variables: {
          customer_name: 'Test User',
          order_id: 'TEST-' + Date.now(),
          total_amount: '$99.99',
          order_items: 'Test Product (Qty: 1) - $99.99',
          shipping_address: '123 Test Street, Test City, TS 12345',
          payment_method: 'Test Payment'
        },
        metadata: {
          testEmail: true,
          sentBy: userEmail
        }
      });

      return NextResponse.json({
        success: testResult.success,
        message: testResult.success 
          ? `✅ Test email sent successfully to ${testEmail}` 
          : `❌ Failed to send test email: ${testResult.error}`,
        logId: testResult.logId,
        error: testResult.error
      });
    }

    return NextResponse.json({ 
      error: 'Invalid test type or missing test email' 
    }, { status: 400 });
    
  } catch (error: any) {
    console.error('Error testing email:', error);
    return NextResponse.json({ 
      error: 'Failed to test email configuration',
      details: error.message 
    }, { status: 500 });
  }
}

// GET - Get email configuration status
export async function GET(request: NextRequest) {
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

    // Check configuration status
    const provider = process.env.EMAIL_PROVIDER || 'smtp';
    const isConfigured = {
      smtp: !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS),
      sendgrid: !!process.env.SENDGRID_API_KEY,
      ses: !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY),
      mailgun: !!(process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN)
    };

    return NextResponse.json({
      success: true,
      provider,
      configured: isConfigured[provider as keyof typeof isConfigured] || false,
      configuration: {
        provider,
        host: provider === 'smtp' ? process.env.SMTP_HOST : 'N/A',
        port: provider === 'smtp' ? process.env.SMTP_PORT : 'N/A',
        user: provider === 'smtp' ? process.env.SMTP_USER : 'N/A',
        fromEmail: process.env.EMAIL_FROM || 'Not configured',
        fromName: process.env.EMAIL_FROM_NAME || 'Not configured'
      },
      availableProviders: Object.keys(isConfigured),
      configurationStatus: isConfigured
    });
    
  } catch (error: any) {
    console.error('Error getting email configuration:', error);
    return NextResponse.json({ 
      error: 'Failed to get email configuration',
      details: error.message 
    }, { status: 500 });
  }
} 