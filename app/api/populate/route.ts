import clientModel from "@/models/Clients";
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { hash } from "bcryptjs";

export async function POST(request: any) {
  const user = await currentUser();
  const global_user_email: any | null | undefined =
    user?.emailAddresses[0]?.emailAddress;

  if (!user || !global_user_email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const existingModel = await clientModel.findOne({ email: global_user_email });

    if (existingModel) {
      // Update all provided fields
      const updates: any = {};
      
      // Update profile fields
      if (body.firstName) updates.firstName = body.firstName;
      if (body.lastName) updates.lastName = body.lastName;
      if (body.mobileNumber) updates.mobileNumber = body.mobileNumber;
      
      // Update cart and wishlist if provided
      if (body.cart) updates.cart = body.cart;
      if (body.wishlist) updates.wishlist = body.wishlist;
      if (body.cartQuantities) updates.cartQuantities = body.cartQuantities;
      if (body.cartSizes) updates.cartSizes = body.cartSizes;
      if (body.orders) updates.orders = body.orders;

      // Only update password if explicitly provided
      if (body.password && body.password !== "existing") {
        updates.password = await hash(body.password, 12);
      }

      // Use findOneAndUpdate to ensure atomic update
      const updatedModel = await clientModel.findOneAndUpdate(
        { email: global_user_email },
        { $set: updates },
        { new: true }
      );

      if (!updatedModel) {
        throw new Error("Failed to update profile");
      }
    } else {
      // Create new client
      const hashedPassword = await hash(body.password || "default", 12);
      
      const new_client = new clientModel({
        username: body.firstName,
        email: global_user_email,
        firstName: body.firstName,
        lastName: body.lastName,
        password: hashedPassword,
        mobileNumber: body.mobileNumber || "Not provided",
        cart: body.cart || [],
        wishlist: body.wishlist || [],
        cartQuantities: body.cartQuantities || new Map(),
        cartSizes: body.cartSizes || new Map(),
        orders: body.orders || []
      });

      const savedClient = await new_client.save();
      
      if (!savedClient) {
        throw new Error("Failed to create profile");
      }

      // Verify the saved data
      const verifiedClient = await clientModel.findOne({ email: global_user_email });
      if (!verifiedClient || 
          verifiedClient.firstName !== body.firstName || 
          verifiedClient.lastName !== body.lastName || 
          verifiedClient.mobileNumber !== body.mobileNumber) {
        throw new Error("Profile data verification failed");
      }
    }

    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json(
      { message: "Error processing request" },
      { status: 500 }
    );
  }
}
