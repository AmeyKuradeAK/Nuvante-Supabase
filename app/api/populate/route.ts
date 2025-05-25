import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import clientModel from "@/models/Clients";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    console.log("Starting populate route...");
    
    const user = await currentUser();
    console.log("Clerk user:", user ? "Found" : "Not found");
    
    if (!user || !user.emailAddresses[0]?.emailAddress) {
      console.error("No user or email found");
      return NextResponse.json({ error: "Unauthorized - No valid session" }, { status: 401 });
    }

    const global_user_email = user.emailAddresses[0].emailAddress;
    console.log("User email:", global_user_email);
    
    const body = await req.json();
    console.log("Request body received:", JSON.stringify(body, null, 2));

    // Check if user already exists
    const existingUser = await clientModel.findOne({ email: global_user_email });
    console.log("Existing user:", existingUser ? "Found" : "Not found");
    
    if (existingUser) {
      console.log("Updating existing user...");
      // Update only the fields that are provided
      const updateData: any = {};
      if (body.firstName) updateData.firstName = body.firstName.trim();
      if (body.lastName) updateData.lastName = body.lastName.trim();
      if (body.mobileNumber) updateData.mobileNumber = body.mobileNumber.trim();
      if (body.email) updateData.email = body.email.trim();
      if (body.username) updateData.username = body.username.trim();
      if (body.cart !== undefined) updateData.cart = body.cart;
      if (body.wishlist !== undefined) updateData.wishlist = body.wishlist;
      if (body.cartQuantities !== undefined) updateData.cartQuantities = body.cartQuantities;
      if (body.cartSizes !== undefined) updateData.cartSizes = body.cartSizes;
      if (body.orders !== undefined) updateData.orders = body.orders;

      console.log("Update data:", updateData);

      const updatedUser = await clientModel.findOneAndUpdate(
        { email: global_user_email },
        { $set: updateData },
        { new: true }
      );

      if (!updatedUser) {
        throw new Error("Failed to update user");
      }

      console.log("User updated:", updatedUser);
      return NextResponse.json(updatedUser);
    } else {
      console.log("Creating new user...");
      
      // Validate required fields
      if (!body.firstName || !body.lastName || !body.mobileNumber) {
        console.error("Missing required fields:", { 
          firstName: body.firstName, 
          lastName: body.lastName, 
          mobileNumber: body.mobileNumber 
        });
        throw new Error("Missing required fields: firstName, lastName, or mobileNumber");
      }
      
      // Create new user with essential fields
      const newClient = new clientModel({
        firstName: body.firstName.trim(),
        lastName: body.lastName.trim(),
        email: global_user_email,
        mobileNumber: body.mobileNumber.trim(),
        password: "clerk-auth", // Since we're using Clerk for auth
        username: body.username || body.firstName || global_user_email.split('@')[0],
        cart: body.cart || [],
        wishlist: body.wishlist || [],
        cartQuantities: body.cartQuantities || {},
        cartSizes: body.cartSizes || {},
        orders: body.orders || []
      });

      console.log("New client object:", newClient);

      try {
        const savedClient = await newClient.save();
        console.log("Client saved successfully:", savedClient);

        // Verify the saved data
        const verifiedClient = await clientModel.findOne({ email: global_user_email });
        if (!verifiedClient) {
          throw new Error("Failed to verify saved client");
        }

        return NextResponse.json(verifiedClient);
      } catch (saveError: any) {
        console.error("Error saving client:", saveError);
        throw new Error(`Failed to save client: ${saveError.message}`);
      }
    }
  } catch (error: any) {
    console.error("Error in populate route:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
