import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connect from '../../../../db';
import EmailTemplate from '../../../../models/EmailTemplate';
import AdminEmail from '../../../../models/AdminEmails';

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

// GET - List all email templates
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
    const templateType = searchParams.get('type');
    const isActive = searchParams.get('active');
    
    const filter: any = {};
    if (templateType) filter.templateType = templateType;
    if (isActive !== null) filter.isActive = isActive === 'true';
    
    const templates = await EmailTemplate.find(filter)
      .sort({ updatedAt: -1 })
      .lean();
    
    return NextResponse.json({ 
      success: true, 
      templates,
      count: templates.length 
    });
    
  } catch (error: any) {
    console.error('Error fetching email templates:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch email templates',
      details: error.message 
    }, { status: 500 });
  }
}

// POST - Create new email template
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
      name, 
      subject, 
      htmlContent, 
      plainTextContent, 
      templateType, 
      variables,
      isActive = true
    } = body;

    // Validate required fields
    if (!name || !subject || !htmlContent || !plainTextContent) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, subject, htmlContent, plainTextContent' 
      }, { status: 400 });
    }

    await connect();

    // Check if template name already exists
    const existingTemplate = await EmailTemplate.findOne({ name });
    if (existingTemplate) {
      return NextResponse.json({ 
        error: 'Template with this name already exists' 
      }, { status: 400 });
    }

    const template = new EmailTemplate({
      name,
      subject,
      htmlContent,
      plainTextContent,
      templateType: templateType || 'custom',
      isActive,
      createdBy: userEmail,
      lastEditedBy: userEmail,
      variables: variables || []
    });

    await template.save();

    return NextResponse.json({ 
      success: true, 
      template,
      message: 'Email template created successfully' 
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Error creating email template:', error);
    return NextResponse.json({ 
      error: 'Failed to create email template',
      details: error.message 
    }, { status: 500 });
  }
} 