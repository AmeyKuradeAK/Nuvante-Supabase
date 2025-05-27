import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import clientModel from "@/models/Clients";
import connect from "@/db";

export async function GET(req: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ 
        isComplete: false, 
        needsAuth: true 
      });
    }

    await connect();

    const primaryEmail = user.emailAddresses[0]?.emailAddress;
    
    if (!primaryEmail) {
      return NextResponse.json({ 
        isComplete: false, 
        error: "No email found" 
      });
    }

    // Find user in database
    const dbUser = await clientModel.findOne({ 
      $or: [
        { clerkId: user.id },
        { email: primaryEmail }
      ]
    });

    if (!dbUser) {
      return NextResponse.json({ 
        isComplete: false, 
        needsProfile: true 
      });
    }

    // Check if profile is complete
    const isComplete = dbUser.firstName && 
                      dbUser.firstName !== 'User' && 
                      dbUser.lastName && 
                      dbUser.lastName !== 'User' && 
                      dbUser.mobileNumber && 
                      dbUser.mobileNumber !== 'Not provided';

    return NextResponse.json({ 
      isComplete,
      needsProfile: !isComplete,
      user: {
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        email: dbUser.email,
        mobileNumber: dbUser.mobileNumber
      }
    });

  } catch (error: any) {
    return NextResponse.json({ 
      isComplete: false,
      error: error.message 
    }, { status: 500 });
  }
} 