import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import clientModel from "@/models/Clients";
import connect from "@/db";

export async function GET(req: NextRequest) {
  try {
    // Get current user from Clerk
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await connect();

    // Find user in database
    const dbUser = await clientModel.findOne({ 
      $or: [
        { clerkId: user.id },
        { email: user.emailAddresses[0]?.emailAddress }
      ]
    });

    // Return debug information
    return NextResponse.json({
      clerk: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        emailAddresses: user.emailAddresses,
        phoneNumbers: user.phoneNumbers,
        publicMetadata: user.publicMetadata,
        privateMetadata: user.privateMetadata,
        unsafeMetadata: user.unsafeMetadata
      },
      database: dbUser ? {
        _id: dbUser._id,
        clerkId: dbUser.clerkId,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        email: dbUser.email,
        mobileNumber: dbUser.mobileNumber,
        username: dbUser.username
      } : null,
      issues: {
        userNotInDb: !dbUser,
        namesMismatch: dbUser && (
          dbUser.firstName !== user.firstName || 
          dbUser.lastName !== user.lastName
        ),
        phoneMismatch: dbUser && user.phoneNumbers?.[0] && 
          dbUser.mobileNumber !== user.phoneNumbers[0].phoneNumber
      }
    });

  } catch (error: any) {
    return NextResponse.json({ 
      error: "Failed to debug user",
      details: error.message 
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Get current user from Clerk
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await connect();

    const primaryEmail = user.emailAddresses[0]?.emailAddress;
    const primaryPhone = user.phoneNumbers?.[0]?.phoneNumber;

    if (!primaryEmail) {
      return NextResponse.json({ error: "No email found" }, { status: 400 });
    }

    // Update or create user in database
    const updatedUser = await clientModel.findOneAndUpdate(
      { $or: [{ clerkId: user.id }, { email: primaryEmail }] },
      {
        $set: {
          clerkId: user.id,
          firstName: user.firstName || "User",
          lastName: user.lastName || "User",
          email: primaryEmail,
          mobileNumber: primaryPhone || "Not provided",
          username: user.firstName || primaryEmail.split('@')[0]
        }
      },
      { new: true, upsert: true }
    );

    return NextResponse.json({
      message: "User data synced successfully",
      user: {
        _id: updatedUser._id,
        clerkId: updatedUser.clerkId,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        mobileNumber: updatedUser.mobileNumber
      }
    });

  } catch (error: any) {
    return NextResponse.json({ 
      error: "Failed to sync user",
      details: error.message 
    }, { status: 500 });
  }
} 