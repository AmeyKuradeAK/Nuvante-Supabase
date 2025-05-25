import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import clientModel from "@/models/Clients";
import connect from "@/db";

export async function GET() {
  try {
    console.log("=== DEBUG USER ENDPOINT ===");
    
    // Get Clerk user
    const user = await currentUser();
    const global_user_email = user?.emailAddresses[0]?.emailAddress;
    
    console.log("Clerk user:", user ? "Found" : "Not found");
    console.log("User email:", global_user_email);
    console.log("User ID:", user?.id);
    
    if (!user || !global_user_email) {
      return NextResponse.json({
        error: "No authenticated user",
        clerkUser: null,
        email: null
      });
    }
    
    // Connect to database
    await connect();
    console.log("Database connected");
    
    // Check if user exists in database
    const dbUser = await clientModel.findOne({ email: global_user_email });
    console.log("Database user:", dbUser ? "Found" : "Not found");
    
    // Get total user count
    const totalUsers = await clientModel.countDocuments();
    console.log("Total users in database:", totalUsers);
    
    // Get sample users
    const sampleUsers = await clientModel.find({}, { email: 1, firstName: 1, lastName: 1 }).limit(5);
    console.log("Sample users:", sampleUsers);
    
    return NextResponse.json({
      clerkUser: {
        id: user.id,
        email: global_user_email,
        firstName: user.firstName,
        lastName: user.lastName,
        emailAddresses: user.emailAddresses?.map(e => e.emailAddress)
      },
      databaseUser: dbUser ? {
        id: dbUser._id,
        email: dbUser.email,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        mobileNumber: dbUser.mobileNumber
      } : null,
      databaseStats: {
        totalUsers,
        sampleUsers: sampleUsers.map(u => ({
          email: u.email,
          firstName: u.firstName,
          lastName: u.lastName
        }))
      }
    });
    
  } catch (error: any) {
    console.error("Debug endpoint error:", error);
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
} 