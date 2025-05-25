import clientModel from "@/models/Clients";
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import mongoose from "mongoose";

function popElement(array: any[], victim: any) {
  return array.filter((element) => element !== victim);
}

export async function POST(request: any) {
  try {
    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      console.log("MongoDB not connected. Current state:", mongoose.connection.readyState);
      const api_key = process.env.NEXT_PUBLIC_API_KEY;
      if (!api_key) {
        console.error("MongoDB connection string is missing");
        return NextResponse.json(
          { error: "Database configuration error" },
          { status: 500 }
        );
      }
      try {
        await mongoose.connect(api_key);
        console.log("MongoDB connected successfully");
      } catch (connectionError) {
        console.error("Failed to connect to MongoDB:", connectionError);
        return NextResponse.json(
          { error: "Database connection failed" },
          { status: 500 }
        );
      }
    }

    const user = await currentUser();
    const global_user_email = user?.emailAddresses[0].emailAddress;

    if (!user || !global_user_email) {
      console.error("No user or email found:", { user, email: global_user_email });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    console.log("Request body:", body);

    let existingModel = await clientModel.findOne({ email: global_user_email });
    console.log("Existing model:", existingModel ? "Found" : "Not found");

    // Check if client record exists
    if (!existingModel) {
      console.error("No client record found for authenticated user:", global_user_email);
      return NextResponse.json({ 
        error: "User profile not found. Please complete your signup process." 
      }, { status: 404 });
    }

    // Validate product ID before adding to wishlist
    if (!body.identifier || typeof body.identifier !== 'string') {
      return NextResponse.json(
        { error: "Invalid product identifier" },
        { status: 400 }
      );
    }

    if (body.append) {
      if (!existingModel.wishlist.includes(body.identifier)) {
        existingModel.wishlist.push(body.identifier);
        console.log("Added to wishlist:", body.identifier);
      }
    } else {
      existingModel.wishlist = popElement(existingModel.wishlist, body.identifier);
      console.log("Removed from wishlist:", body.identifier);
    }

    try {
      await existingModel.save();
      console.log("Changes saved successfully");
      return NextResponse.json({ success: true }, { status: 200 });
    } catch (saveError: any) {
      console.error("Error saving changes:", saveError);
      return NextResponse.json(
        { error: "Failed to save changes", details: saveError instanceof Error ? saveError.message : "Unknown error" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Unexpected error in wishlist route:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
