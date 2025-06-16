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

// POST - Send email(s)
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
    const { 
      templateId, 
      templateName, 
      recipients, 
      variables,
      isBulk = false
    } = body;

    if (!templateId && !templateName) {
      return NextResponse.json({ 
        error: 'Either templateId or templateName is required' 
      }, { status: 400 });
    }

    if (!recipients || recipients.length === 0) {
      return NextResponse.json({ 
        error: 'Recipients array is required and cannot be empty' 
      }, { status: 400 });
    }

    const emailService = EmailService.getInstance();

    if (isBulk && recipients.length > 1) {
      // Send bulk emails
      const bulkRecipients = recipients.map((recipient: any) => ({
        email: recipient.email,
        name: recipient.name,
        variables: { ...variables, ...recipient.variables }
      }));

      const result = await emailService.sendBulkEmails(
        bulkRecipients,
        { templateId, templateName }
      );

      return NextResponse.json({
        success: true,
        message: `Bulk email sent to ${result.success} recipients, ${result.failed} failed`,
        stats: {
          sent: result.success,
          failed: result.failed,
          total: recipients.length
        },
        results: result.results
      });
    } else {
      // Send single email
      const recipient = recipients[0];
      const result = await emailService.sendEmail({
        templateId,
        templateName,
        recipientEmail: recipient.email,
        recipientName: recipient.name,
        variables: { ...variables, ...recipient.variables }
      });

      return NextResponse.json({
        success: result.success,
        message: result.success ? 'Email sent successfully' : 'Failed to send email',
        error: result.error,
        logId: result.logId
      });
    }
    
  } catch (error: any) {
    console.error('Error sending email:', error);
    return NextResponse.json({ 
      error: 'Failed to send email',
      details: error.message 
    }, { status: 500 });
  }
} 