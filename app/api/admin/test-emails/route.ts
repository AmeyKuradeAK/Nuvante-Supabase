import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connect from '../../../../db';
import AdminEmail from '../../../../models/AdminEmails';
import EmailLog from '../../../../models/EmailLog';
import EmailTemplate from '../../../../models/EmailTemplate';

// Hardcoded fallback admin emails
const FALLBACK_ADMINS = [
  'admin@nuvante.com',
  'ameykurade60@gmail.com',
  'support@nuvante.in',
  'alan.noble777@gmail.com',
];

// Check if user is admin
async function checkAdminStatus(userEmail: string): Promise<boolean> {
  if (FALLBACK_ADMINS.includes(userEmail.toLowerCase())) {
    return true;
  }

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

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = request.headers.get('x-user-email');
    if (!userEmail || !(await checkAdminStatus(userEmail))) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await connect();
    
    // Get active templates
    const templates = await EmailTemplate.find({ isActive: true });
    
    if (templates.length === 0) {
      return NextResponse.json({ 
        error: 'No active templates found. Please create templates first.' 
      }, { status: 400 });
    }

    // Generate sample email logs
    const sampleEmails = [
      'customer1@example.com',
      'user2@test.com',
      'buyer3@nuvante.com',
      'client4@gmail.com',
      'customer5@outlook.com',
      'user6@yahoo.com',
      'client7@hotmail.com',
      'buyer8@company.com'
    ];

    const sampleNames = [
      'Amit Sharma',
      'Priya Patel',
      'Rahul Gupta',
      'Sneha Reddy',
      'Vikram Singh',
      'Anita Kumar',
      'Rajesh Verma',
      'Meera Joshi'
    ];

    const statuses = ['sent', 'sent', 'sent', 'sent', 'failed', 'pending']; // 4 success, 1 failure, 1 pending
    const subjects = [
      'Welcome to Nuvante - Your Fashion Journey Begins!',
      'Order Confirmation #NUV-{orderId}',
      'Your Order Has Been Shipped! Track Here',
      'Password Reset Request',
      'Exclusive Fashion Newsletter - New Arrivals'
    ];

    const createdLogs = [];

    // Create logs for the last 7 days
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const logDate = new Date();
      logDate.setDate(logDate.getDate() - dayOffset);
      logDate.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), 0, 0);

      // Create 2-5 logs per day
      const logsPerDay = Math.floor(Math.random() * 4) + 2;
      
      for (let i = 0; i < logsPerDay; i++) {
        const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
        const randomEmail = sampleEmails[Math.floor(Math.random() * sampleEmails.length)];
        const randomName = sampleNames[Math.floor(Math.random() * sampleNames.length)];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        const randomSubject = subjects[Math.floor(Math.random() * subjects.length)]
          .replace('{orderId}', (Math.floor(Math.random() * 10000) + 1000).toString());

        const emailLog = new EmailLog({
          templateId: randomTemplate._id,
          recipientEmail: randomEmail,
          recipientName: randomName,
          subject: randomSubject,
          status: randomStatus,
          sentAt: randomStatus === 'sent' ? logDate : undefined,
          failureReason: randomStatus === 'failed' ? 'SMTP connection timeout' : undefined,
          orderId: randomStatus !== 'pending' ? `ORD-${Math.floor(Math.random() * 10000) + 1000}` : undefined,
          userId: userId,
          createdAt: logDate,
          metadata: {
            testData: true,
            generatedAt: new Date().toISOString()
          }
        });

        await emailLog.save();
        createdLogs.push({
          template: randomTemplate.name,
          recipient: randomEmail,
          status: randomStatus,
          date: logDate.toISOString()
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: '✅ Sample email logs generated successfully!',
      count: createdLogs.length,
      breakdown: {
        sent: createdLogs.filter(log => log.status === 'sent').length,
        failed: createdLogs.filter(log => log.status === 'failed').length,
        pending: createdLogs.filter(log => log.status === 'pending').length
      },
      logs: createdLogs,
      note: 'Analytics will now show real data from these sample emails'
    });

  } catch (error: any) {
    console.error('Error generating test emails:', error);
    return NextResponse.json({ 
      error: 'Failed to generate test emails',
      details: error.message 
    }, { status: 500 });
  }
} 