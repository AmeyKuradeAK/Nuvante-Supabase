import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connect from '../../../../../db';
import EmailTemplate from '../../../../../models/EmailTemplate';
import AdminEmail from '../../../../../models/AdminEmails';

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

// GET - Get specific email template
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    
    const { id } = await params;
    const template = await EmailTemplate.findById(id);
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      template 
    });
    
  } catch (error: any) {
    console.error('Error fetching email template:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch email template',
      details: error.message 
    }, { status: 500 });
  }
}

// PUT - Update email template
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
      isActive
    } = body;

    await connect();

    const { id } = await params;
    const template = await EmailTemplate.findById(id);
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Check if new name conflicts with existing template (excluding current one)
    if (name && name !== template.name) {
      const existingTemplate = await EmailTemplate.findOne({ 
        name, 
        _id: { $ne: id } 
      });
      if (existingTemplate) {
        return NextResponse.json({ 
          error: 'Template with this name already exists' 
        }, { status: 400 });
      }
    }

    // Update fields
    const updates: any = { lastEditedBy: userEmail };
    if (name) updates.name = name;
    if (subject) updates.subject = subject;
    if (htmlContent) updates.htmlContent = htmlContent;
    if (plainTextContent) updates.plainTextContent = plainTextContent;
    if (templateType) updates.templateType = templateType;
    if (variables !== undefined) updates.variables = variables;
    if (isActive !== undefined) updates.isActive = isActive;

    const updatedTemplate = await EmailTemplate.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    return NextResponse.json({ 
      success: true, 
      template: updatedTemplate,
      message: 'Email template updated successfully' 
    });
    
  } catch (error: any) {
    console.error('Error updating email template:', error);
    return NextResponse.json({ 
      error: 'Failed to update email template',
      details: error.message 
    }, { status: 500 });
  }
}

// DELETE - Delete email template
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const template = await EmailTemplate.findByIdAndDelete(id);
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Email template deleted successfully' 
    });
    
  } catch (error: any) {
    console.error('Error deleting email template:', error);
    return NextResponse.json({ 
      error: 'Failed to delete email template',
      details: error.message 
    }, { status: 500 });
  }
} 