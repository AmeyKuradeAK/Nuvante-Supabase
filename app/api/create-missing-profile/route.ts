import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import clientModel from "@/models/Clients";
import connect from "@/db";

export async function POST() {
  try {
    console.log("=== CREATE MISSING PROFILE ===");
    
    // Get Clerk user
    const user = await currentUser();
    const global_user_email = user?.emailAddresses[0]?.emailAddress;
    
    console.log("Clerk user:", user ? "Found" : "Not found");
    console.log("User email:", global_user_email);
    console.log("User ID:", user?.id);
    console.log("User firstName:", user?.firstName);
    console.log("User lastName:", user?.lastName);
    
    if (!user || !global_user_email) {
      return NextResponse.json({
        error: "No authenticated user found"
      }, { status: 401 });
    }
    
    // Connect to database
    await connect();
    console.log("Database connected");
    
    // Check if user already exists
    const existingUser = await clientModel.findOne({ email: global_user_email });
    if (existingUser) {
      return NextResponse.json({
        message: "User profile already exists",
        user: {
          email: existingUser.email,
          firstName: existingUser.firstName,
          lastName: existingUser.lastName,
          mobileNumber: existingUser.mobileNumber
        }
      });
    }
    
    // Get user data from Clerk
    const firstName = user.firstName || "User";
    const lastName = user.lastName || "User";
    
    console.log("Creating user with:", { firstName, lastName, email: global_user_email });
    
    // Create new user profile
    const newClient = new clientModel({
      firstName: firstName,
      lastName: lastName,
      email: global_user_email,
      mobileNumber: "Not provided", // User can update this later
      password: "clerk-auth",
      username: firstName || global_user_email.split('@')[0],
      cart: [],
      wishlist: [],
      cartQuantities: {},
      cartSizes: {},
      orders: []
    });
    
    const savedClient = await newClient.save();
    console.log("User profile created:", {
      id: savedClient._id,
      email: savedClient.email,
      firstName: savedClient.firstName,
      lastName: savedClient.lastName
    });
    
    return NextResponse.json({
      message: "User profile created successfully",
      user: {
        id: savedClient._id,
        email: savedClient.email,
        firstName: savedClient.firstName,
        lastName: savedClient.lastName,
        mobileNumber: savedClient.mobileNumber
      }
    });
    
  } catch (error: any) {
    console.error("Create missing profile error:", error);
    return NextResponse.json({
      error: error.message,
      details: error.stack
    }, { status: 500 });
  }
} 