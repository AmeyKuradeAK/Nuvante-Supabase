import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import clientModel from "@/models/Clients";
import connect from "@/db";

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

    // Check if user already exists
    const existingUser = await clientModel.findOne({ 
      $or: [
        { clerkId: user.id },
        { email: primaryEmail }
      ]
    });

    if (existingUser) {
      // Update existing user with latest Clerk data
      const updatedUser = await clientModel.findOneAndUpdate(
        { _id: existingUser._id },
        {
          $set: {
            clerkId: user.id,
            firstName: user.firstName || existingUser.firstName || "User",
            lastName: user.lastName || existingUser.lastName || "User",
            email: primaryEmail,
            mobileNumber: primaryPhone || existingUser.mobileNumber || "Not provided",
            username: user.firstName || existingUser.username || primaryEmail.split('@')[0]
          }
        },
        { new: true }
      );

      return NextResponse.json({
        message: "User profile updated successfully",
        action: "updated",
        user: {
          _id: updatedUser._id,
          clerkId: updatedUser.clerkId,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          email: updatedUser.email,
          mobileNumber: updatedUser.mobileNumber
        }
      });
    }

    // Create new user profile
    const newClient = new clientModel({
      clerkId: user.id,
      firstName: user.firstName || "User",
      lastName: user.lastName || "User",
      email: primaryEmail,
      mobileNumber: primaryPhone || "Not provided",
      password: "clerk-auth",
      username: user.firstName || primaryEmail.split('@')[0],
      cart: [],
      wishlist: [],
      cartQuantities: {},
      cartSizes: {},
      orders: []
    });

    const savedClient = await newClient.save();

    return NextResponse.json({
      message: "User profile created successfully",
      action: "created",
      user: {
        _id: savedClient._id,
        clerkId: savedClient.clerkId,
        firstName: savedClient.firstName,
        lastName: savedClient.lastName,
        email: savedClient.email,
        mobileNumber: savedClient.mobileNumber
      }
    });

  } catch (error: any) {
    return NextResponse.json({ 
      error: "Failed to create user profile",
      details: error.message 
    }, { status: 500 });
  }
} 