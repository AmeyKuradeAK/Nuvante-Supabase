import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import EmailService from '../../../../lib/emailService';

// Hardcoded fallback admin emails
const FALLBACK_ADMINS = [
  'admin@nuvante.com',
  'ameykurade60@gmail.com',
  'support@nuvante.in',
  'alan.noble777@gmail.com',
];

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = request.headers.get('x-user-email');
    if (!userEmail || !FALLBACK_ADMINS.includes(userEmail.toLowerCase())) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Check all required environment variables
    const requiredEnvVars = {
      'EMAIL_PROVIDER': process.env.EMAIL_PROVIDER || 'smtp',
      'SMTP_HOST': process.env.SMTP_HOST,
      'SMTP_PORT': process.env.SMTP_PORT || '587',
      'SMTP_USER': process.env.SMTP_USER,
      'SMTP_PASS': process.env.SMTP_PASS ? '***HIDDEN***' : undefined,
      'EMAIL_FROM': process.env.EMAIL_FROM,
      'EMAIL_FROM_NAME': process.env.EMAIL_FROM_NAME || 'Nuvante',
      'EMAIL_DOMAIN': process.env.EMAIL_DOMAIN,
      'NEXT_PUBLIC_SITE_URL': process.env.NEXT_PUBLIC_SITE_URL
    };

    // Check what's missing
    const missingVars: string[] = [];
    const presentVars: string[] = [];

    Object.entries(requiredEnvVars).forEach(([key, value]) => {
      if (!value || value === undefined) {
        missingVars.push(key);
      } else {
        presentVars.push(key);
      }
    });

    // Test email connection
    const emailService = EmailService.getInstance();
    const connectionTest = await emailService.testConnection();

    // Determine the issue
    let diagnosis = '';
    let recommendation = '';
    let severity = 'info';

    if (missingVars.length > 0) {
      severity = 'critical';
      diagnosis = '🚨 CRITICAL: Missing SMTP configuration! Emails are being simulated, not sent.';
      recommendation = `Configure these environment variables in your deployment platform:
      
Required for GoDaddy SMTP:
• SMTP_HOST=smtpout.secureserver.net
• SMTP_PORT=587
• SMTP_USER=support@nuvante.in
• SMTP_PASS=your-godaddy-email-password
• EMAIL_FROM=support@nuvante.in
• EMAIL_FROM_NAME=Nuvante

Optional but recommended:
• EMAIL_DOMAIN=nuvante.in
• NEXT_PUBLIC_SITE_URL=https://nuvante.in`;
    } else if (!connectionTest.success) {
      severity = 'error';
      diagnosis = '❌ SMTP configuration present but connection failed.';
      recommendation = `Check your SMTP credentials and server settings. Error: ${connectionTest.error}`;
    } else {
      severity = 'success';
      diagnosis = '✅ Email configuration is working correctly!';
      recommendation = 'Email system is properly configured and ready to send emails.';
    }

    const configStatus = {
      success: true,
      severity,
      diagnosis,
      recommendation,
      configuration: {
        provider: requiredEnvVars.EMAIL_PROVIDER,
        presentVariables: presentVars,
        missingVariables: missingVars,
        connectionTest: {
          success: connectionTest.success,
          error: connectionTest.error,
          provider: connectionTest.provider
        }
      },
      environmentSetup: {
        platform: 'Vercel/Netlify/Railway',
        requiredVariables: [
          {
            name: 'SMTP_HOST',
            value: 'smtpout.secureserver.net',
            description: 'GoDaddy SMTP server'
          },
          {
            name: 'SMTP_PORT',
            value: '587',
            description: 'SMTP port for TLS'
          },
          {
            name: 'SMTP_USER',
            value: 'support@nuvante.in',
            description: 'Your GoDaddy email address'
          },
          {
            name: 'SMTP_PASS',
            value: 'your-email-password',
            description: 'Your GoDaddy email password'
          },
          {
            name: 'EMAIL_FROM',
            value: 'support@nuvante.in',
            description: 'From email address'
          },
          {
            name: 'EMAIL_FROM_NAME',
            value: 'Nuvante',
            description: 'From name in emails'
          }
        ]
      },
      troubleshooting: {
        commonIssues: [
          'Environment variables not set in production platform',
          'Incorrect SMTP credentials',
          'GoDaddy email password changed',
          'SMTP server firewall restrictions',
          'Email provider security settings'
        ],
        testCommands: [
          'Check if welcome template exists',
          'Check if order_confirmation template exists',
          'Test SMTP connection',
          'Send test email'
        ]
      }
    };

    return NextResponse.json(configStatus);

  } catch (error: any) {
    console.error('Error checking email configuration:', error);
    return NextResponse.json({ 
      error: 'Failed to check email configuration',
      details: error.message 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = request.headers.get('x-user-email');
    if (!userEmail || !FALLBACK_ADMINS.includes(userEmail.toLowerCase())) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { testEmail } = await request.json();

    if (!testEmail) {
      return NextResponse.json({ error: 'Test email address required' }, { status: 400 });
    }

    // Test email sending
    const emailService = EmailService.getInstance();
    
    console.log('🧪 Testing email configuration with test send to:', testEmail);
    
    const testResult = await emailService.sendEmail({
      templateName: 'welcome',
      recipientEmail: testEmail,
      recipientName: 'Test User',
      variables: {
        customer_name: 'Test User',
        website_url: process.env.NEXT_PUBLIC_SITE_URL || 'https://nuvante.in',
        current_year: new Date().getFullYear().toString()
      },
      metadata: {
        testEmail: true,
        timestamp: new Date().toISOString()
      }
    });

    return NextResponse.json({
      success: testResult.success,
      message: testResult.success 
        ? '✅ Test email sent successfully!' 
        : '❌ Test email failed to send',
      error: testResult.error,
      logId: testResult.logId,
      diagnosis: testResult.success 
        ? 'Email system is working correctly in production!' 
        : 'Email system is not properly configured. Check environment variables.',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error testing email configuration:', error);
    return NextResponse.json({ 
      error: 'Failed to test email configuration',
      details: error.message 
    }, { status: 500 });
  }
} 