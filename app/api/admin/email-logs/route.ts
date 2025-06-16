import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connect from '../../../../db';
import AdminEmail from '../../../../models/AdminEmails';
import EmailLog from '../../../../models/EmailLog';
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

// GET - Get email logs with filtering and pagination
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

    await connect();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status');
    const recipientEmail = searchParams.get('email');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const templateId = searchParams.get('templateId');
    const orderId = searchParams.get('orderId');
    const includeStats = searchParams.get('includeStats') === 'true';

    // Build filter
    const filter: any = {};
    if (status) filter.status = status;
    if (recipientEmail) filter.recipientEmail = { $regex: recipientEmail, $options: 'i' };
    if (templateId) filter.templateId = templateId;
    if (orderId) filter.orderId = orderId;
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Get paginated logs
    const skip = (page - 1) * limit;
    const logsQuery = EmailLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('templateId', 'name templateType');

    const [logs, totalCount] = await Promise.all([
      logsQuery.exec(),
      EmailLog.countDocuments(filter)
    ]);

    const response: any = {
      success: true,
      logs,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        limit,
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPrevPage: page > 1
      }
    };

    // Include statistics if requested
    if (includeStats) {
      const emailService = EmailService.getInstance();
      const stats = await emailService.getEmailStats(
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined
      );
      response.stats = stats;
    }

    return NextResponse.json(response);
    
  } catch (error: any) {
    console.error('Error fetching email logs:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch email logs',
      details: error.message 
    }, { status: 500 });
  }
} 