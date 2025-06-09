import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import AdminEmail from "@/models/AdminEmails";
import connect from "@/db";

// Hardcoded fallback admin emails (these will always be admins)
const FALLBACK_ADMINS = [
  'admin@nuvante.com',
  'ameykurade60@gmail.com',
  'support@nuvante.in',
];

// Helper function to check if user is admin
async function isAdmin(userEmail: string): Promise<boolean> {
  // Check fallback admins first
  if (FALLBACK_ADMINS.includes(userEmail)) {
    return true;
  }

  try {
    await connect();
    const adminEmail = await AdminEmail.findOne({ 
      email: userEmail.toLowerCase(), 
      isActive: true 
    });
    return !!adminEmail;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

// GET - List all admin emails
export async function GET(req: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userEmail = user.emailAddresses[0]?.emailAddress;
    if (!userEmail || !(await isAdmin(userEmail))) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    await connect();

    // Get database admin emails
    const dbAdminEmails = await AdminEmail.find({ isActive: true })
      .select('email addedBy addedAt')
      .sort({ addedAt: -1 });

    // Combine with fallback admins
    const allAdminEmails = [
      ...FALLBACK_ADMINS.map(email => ({
        email,
        addedBy: 'System',
        addedAt: new Date('2024-01-01'),
        isSystemAdmin: true
      })),
      ...dbAdminEmails.map(admin => ({
        email: admin.email,
        addedBy: admin.addedBy,
        addedAt: admin.addedAt,
        isSystemAdmin: false
      }))
    ];

    return NextResponse.json({
      success: true,
      adminEmails: allAdminEmails,
      totalCount: allAdminEmails.length
    });

  } catch (error: any) {
    console.error('Error fetching admin emails:', error);
    return NextResponse.json({ 
      error: "Failed to fetch admin emails",
      details: error.message 
    }, { status: 500 });
  }
}

// POST - Add new admin email
export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userEmail = user.emailAddresses[0]?.emailAddress;
    if (!userEmail || !(await isAdmin(userEmail))) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ 
        error: "Email is required" 
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ 
        error: "Invalid email format" 
      }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if email is already a fallback admin
    if (FALLBACK_ADMINS.includes(normalizedEmail)) {
      return NextResponse.json({ 
        error: "This email is already a system admin" 
      }, { status: 409 });
    }

    await connect();

    // Check if email already exists in database
    const existingAdmin = await AdminEmail.findOne({ email: normalizedEmail });
    if (existingAdmin) {
      if (existingAdmin.isActive) {
        return NextResponse.json({ 
          error: "This email is already an admin" 
        }, { status: 409 });
      } else {
        // Reactivate if it was deactivated
        existingAdmin.isActive = true;
        existingAdmin.addedBy = userEmail;
        existingAdmin.addedAt = new Date();
        await existingAdmin.save();
        
        return NextResponse.json({
          success: true,
          message: "Admin email reactivated successfully",
          adminEmail: existingAdmin.email
        });
      }
    }

    // Create new admin email
    const newAdminEmail = new AdminEmail({
      email: normalizedEmail,
      addedBy: userEmail,
      isActive: true
    });

    await newAdminEmail.save();

    return NextResponse.json({
      success: true,
      message: "Admin email added successfully",
      adminEmail: newAdminEmail.email,
      addedBy: userEmail
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error adding admin email:', error);
    return NextResponse.json({ 
      error: "Failed to add admin email",
      details: error.message 
    }, { status: 500 });
  }
}

// Note: isAdmin function is available within this route for internal use 