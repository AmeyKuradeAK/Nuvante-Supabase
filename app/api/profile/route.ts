import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import clientModel from "@/models/Clients";
import connect from "@/db";

// GET - Fetch user profile
export async function GET(req: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await connect();

    const primaryEmail = user.emailAddresses[0]?.emailAddress;
    
    if (!primaryEmail) {
      return NextResponse.json({ error: "No email found" }, { status: 400 });
    }

    // Find user in database
    let dbUser = await clientModel.findOne({ 
      $or: [
        { clerkId: user.id },
        { email: primaryEmail }
      ]
    });

    // If user doesn't exist in database, create them
    if (!dbUser) {
      // Try to extract name from email if Clerk doesn't have it
      const emailName = primaryEmail.split('@')[0];
      const nameParts = emailName.split(/[._-]/);
      
      const newClient = new clientModel({
        clerkId: user.id,
        firstName: user.firstName || (nameParts[0] ? nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1) : "User"),
        lastName: user.lastName || (nameParts[1] ? nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1) : "User"),
        email: primaryEmail,
        mobileNumber: user.phoneNumbers?.[0]?.phoneNumber || "Not provided",
        password: "clerk-auth",
        username: user.firstName || emailName,
        cart: [],
        wishlist: [],
        cartQuantities: {},
        cartSizes: {},
        orders: []
      });

      dbUser = await newClient.save();
    }

    return NextResponse.json({
      user: {
        _id: dbUser._id,
        clerkId: dbUser.clerkId,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        email: dbUser.email,
        mobileNumber: dbUser.mobileNumber,
        username: dbUser.username,
        cart: dbUser.cart,
        wishlist: dbUser.wishlist,
        orders: dbUser.orders
      }
    });

  } catch (error: any) {
    return NextResponse.json({ 
      error: "Failed to fetch profile",
      details: error.message 
    }, { status: 500 });
  }
}

// PUT - Update user profile
export async function PUT(req: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const { firstName, lastName, mobileNumber } = body;

    await connect();

    const primaryEmail = user.emailAddresses[0]?.emailAddress;
    
    if (!primaryEmail) {
      return NextResponse.json({ error: "No email found" }, { status: 400 });
    }

    // Update user profile
    const updatedUser = await clientModel.findOneAndUpdate(
      { $or: [{ clerkId: user.id }, { email: primaryEmail }] },
      {
        $set: {
          ...(firstName && { firstName }),
          ...(lastName && { lastName }),
          ...(mobileNumber && { mobileNumber }),
          clerkId: user.id, // Ensure clerkId is always set
          email: primaryEmail // Ensure email is always current
        }
      },
      { new: true, upsert: true }
    );

    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        _id: updatedUser._id,
        clerkId: updatedUser.clerkId,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        mobileNumber: updatedUser.mobileNumber,
        username: updatedUser.username
      }
    });

  } catch (error: any) {
    return NextResponse.json({ 
      error: "Failed to update profile",
      details: error.message 
    }, { status: 500 });
  }
} 