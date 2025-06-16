import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connect from '../../../../db';
import AdminEmail from '../../../../models/AdminEmails';
import EmailLog from '../../../../models/EmailLog';
import EmailTemplate from '../../../../models/EmailTemplate';
import EmailService from '../../../../lib/emailService';

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

export async function GET(request: NextRequest) {
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
    
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get comprehensive email statistics
    const emailService = EmailService.getInstance();
    const overallStats = await emailService.getEmailStats(startDate);

    // Get template performance data
    const templates = await EmailTemplate.find({ isActive: true });
    const templatePerformance = await Promise.all(
      templates.map(async (template) => {
        const templateLogs = await EmailLog.find({
          templateId: template._id,
          createdAt: { $gte: startDate }
        });

        const totalSent = templateLogs.length;
        const successfulSent = templateLogs.filter(log => log.status === 'sent').length;
        const failedSent = templateLogs.filter(log => log.status === 'failed').length;
        const pendingSent = templateLogs.filter(log => log.status === 'pending').length;

        return {
          templateId: template._id,
          templateName: template.name,
          templateType: template.templateType,
          totalSent,
          successfulSent,
          failedSent,
          pendingSent,
          deliveryRate: totalSent > 0 ? ((successfulSent / totalSent) * 100).toFixed(1) : '0',
          lastUsed: templateLogs.length > 0 ? templateLogs[templateLogs.length - 1].createdAt : null
        };
      })
    );

    // Get recent activity (last 10 activities)
    const recentActivity = await EmailLog.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('templateId', 'name templateType');

    // Get daily stats for the last 7 days
    const dailyStats = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));

      const dayLogs = await EmailLog.find({
        createdAt: { $gte: startOfDay, $lte: endOfDay }
      });

      const daySent = dayLogs.filter(log => log.status === 'sent').length;
      const dayFailed = dayLogs.filter(log => log.status === 'failed').length;
      const dayPending = dayLogs.filter(log => log.status === 'pending').length;

      dailyStats.push({
        date: startOfDay.toISOString().split('T')[0],
        sent: daySent,
        failed: dayFailed,
        pending: dayPending,
        total: dayLogs.length
      });
    }

    // Get top performing templates
    const topTemplates = templatePerformance
      .filter(t => t.totalSent > 0)
      .sort((a, b) => parseFloat(b.deliveryRate) - parseFloat(a.deliveryRate))
      .slice(0, 5);

    // Calculate system health metrics
    const totalActiveTemplates = templates.length;
    const templatesWithActivity = templatePerformance.filter(t => t.totalSent > 0).length;
    const systemHealth = {
      activeTemplates: totalActiveTemplates,
      templatesInUse: templatesWithActivity,
      utilizationRate: totalActiveTemplates > 0 ? ((templatesWithActivity / totalActiveTemplates) * 100).toFixed(1) : '0',
      avgDeliveryRate: templatePerformance.length > 0 
        ? (templatePerformance.reduce((sum, t) => sum + parseFloat(t.deliveryRate), 0) / templatePerformance.length).toFixed(1)
        : '0'
    };

    // Error rate analysis
    const errorAnalysis = {
      totalErrors: overallStats.failed,
      errorRate: overallStats.total > 0 ? ((overallStats.failed / overallStats.total) * 100).toFixed(2) : '0',
      commonErrors: [] // Could be expanded to analyze failure reasons
    };

    const analytics = {
      success: true,
      period: `Last ${days} days`,
      generatedAt: new Date().toISOString(),
      
      // Overall metrics
      overallStats,
      
      // Template performance
      templatePerformance,
      topPerformingTemplates: topTemplates,
      
      // Recent activity
      recentActivity: recentActivity.map(log => ({
        id: log._id,
        templateName: log.templateId?.name || 'Unknown Template',
        templateType: log.templateId?.templateType || 'unknown',
        recipientEmail: log.recipientEmail,
        status: log.status,
        subject: log.subject,
        failureReason: log.failureReason,
        createdAt: log.createdAt,
        sentAt: log.sentAt
      })),
      
      // Trend data
      dailyStats,
      
      // System health
      systemHealth,
      
      // Error analysis
      errorAnalysis,
      
      // Quick insights
      insights: {
        totalEmailsProcessed: overallStats.total,
        successRate: overallStats.total > 0 ? ((overallStats.sent / overallStats.total) * 100).toFixed(1) : '0',
        mostActiveTemplate: topTemplates.length > 0 ? topTemplates[0].templateName : 'None',
        systemStatus: overallStats.failed / Math.max(overallStats.total, 1) < 0.05 ? 'Healthy' : 'Needs Attention'
      }
    };

    return NextResponse.json(analytics);
    
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch analytics',
      details: error.message 
    }, { status: 500 });
  }
} 