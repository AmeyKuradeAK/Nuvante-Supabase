import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import clientModel from "@/models/Clients";
import bcrypt from "bcryptjs";
import connect from "@/db";

export async function POST(req: Request) {
  try {
    // Ensure database connection
    await connect();
    
    const user = await currentUser();
    const clerkId = user?.id;
    const global_user_email = user?.emailAddresses[0]?.emailAddress;
    
    if (!user || !clerkId) {
      return NextResponse.json({ error: "Unauthorized - No valid session" }, { status: 401 });
    }
    
    const body = await req.json();

    // Check if user already exists by clerkId first, then email
    let existingUser = await clientModel.findOne({ clerkId: clerkId });
    
    // If not found by clerkId, try email (for backward compatibility)
    if (!existingUser && global_user_email) {
      existingUser = await clientModel.findOne({ email: global_user_email });
      
      // If found by email but missing clerkId, update it
      if (existingUser && !existingUser.clerkId) {
        existingUser.clerkId = clerkId;
        await existingUser.save();
      }
    }
    
    if (existingUser) {
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

      const updatedUser = await clientModel.findOneAndUpdate(
        { clerkId: clerkId },
        { $set: updateData },
        { new: true }
      );

      if (!updatedUser) {
        throw new Error("Failed to update user");
      }

      return NextResponse.json(updatedUser);
    } else {
      // Validate required fields
      if (!body.firstName || !body.mobileNumber) {
        throw new Error("Missing required fields: firstName or mobileNumber");
      }
      
      // Ensure lastName is not undefined/null (empty string is OK)
      if (body.lastName === undefined || body.lastName === null) {
        body.lastName = "";
      }
      
      const email = global_user_email || user.emailAddresses[0]?.emailAddress || "";
      if (!email) {
        throw new Error("No email found for user");
      }
      
      // Create new user with essential fields
      const newClient = new clientModel({
        clerkId: clerkId,
        firstName: body.firstName.trim(),
        lastName: body.lastName.trim(),
        email: email,
        mobileNumber: body.mobileNumber.trim(),
        password: "clerk-auth",
        username: body.username || body.firstName || email.split('@')[0],
        cart: body.cart || [],
        wishlist: body.wishlist || [],
        cartQuantities: body.cartQuantities || {},
        cartSizes: body.cartSizes || {},
        orders: body.orders || []
      });

      try {
        const savedClient = await newClient.save();

        // Verify the saved data
        const verifiedClient = await clientModel.findOne({ clerkId: clerkId });
        if (!verifiedClient) {
          throw new Error("Failed to verify saved client");
        }

        return NextResponse.json(verifiedClient);
      } catch (saveError: any) {
        throw new Error(`Failed to save client: ${saveError.message}`);
      }
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
