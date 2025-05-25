import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import clientModel from "@/models/Clients";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user || !user.emailAddresses[0]?.emailAddress) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const global_user_email = user.emailAddresses[0].emailAddress;
    const body = await req.json();

    // Check if user already exists
    const existingUser = await clientModel.findOne({ email: global_user_email });
    
    if (existingUser) {
      // Update only the fields that are provided
      const updateData: any = {};
      if (body.firstName) updateData.firstName = body.firstName;
      if (body.lastName) updateData.lastName = body.lastName;
      if (body.mobileNumber) updateData.mobileNumber = body.mobileNumber;
      if (body.email) updateData.email = body.email;
      if (body.username) updateData.username = body.username;
      if (body.cart) updateData.cart = body.cart;
      if (body.wishlist) updateData.wishlist = body.wishlist;
      if (body.cartQuantities) updateData.cartQuantities = body.cartQuantities;
      if (body.cartSizes) updateData.cartSizes = body.cartSizes;
      if (body.orders) updateData.orders = body.orders;

      // Only hash password if it's provided and not "clerk-auth"
      if (body.password && body.password !== "clerk-auth") {
        updateData.password = await bcrypt.hash(body.password, 10);
      }

      const updatedUser = await clientModel.findOneAndUpdate(
        { email: global_user_email },
        { $set: updateData },
        { new: true }
      );

      return NextResponse.json(updatedUser);
    } else {
      // Create new user with essential fields
      const newClient = new clientModel({
        firstName: body.firstName || "",
        lastName: body.lastName || "",
        email: global_user_email,
        mobileNumber: body.mobileNumber || "",
        password: "clerk-auth", // Since we're using Clerk for auth
        username: body.username || body.firstName || global_user_email.split('@')[0],
        cart: body.cart || [],
        wishlist: body.wishlist || [],
        cartQuantities: body.cartQuantities || {},
        cartSizes: body.cartSizes || {},
        orders: body.orders || []
      });

      const savedClient = await newClient.save();
      return NextResponse.json(savedClient);
    }
  } catch (error: any) {
    console.error("Error in populate route:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
