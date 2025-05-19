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

    // Create a new client record if it doesn't exist
    if (!existingModel) {
      console.log("Creating new client record for:", global_user_email);
      try {
        // Get user's full name from Clerk
        const fullName = user.fullName || "";
        const [firstName = "", lastName = ""] = fullName.split(" ");

        // Create new client with all required fields
        existingModel = await clientModel.create({
          username: user.username || global_user_email.split('@')[0], // Use email username if no username
          password: "clerk-auth", // Since we're using Clerk for auth
          firstName: firstName || "User", // Default value if empty
          lastName: lastName || "User", // Default value if empty
          email: global_user_email,
          address: "Address not provided", // Default value for required field
          cart: [], // Initialize empty cart array
          wishlist: [], // Initialize empty wishlist array
        });
        console.log("New client record created successfully");
      } catch (createError) {
        console.error("Error creating client record:", createError);
        return NextResponse.json(
          { error: "Failed to create client record", details: createError instanceof Error ? createError.message : "Unknown error" },
          { status: 500 }
        );
      }
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
    } catch (saveError) {
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
