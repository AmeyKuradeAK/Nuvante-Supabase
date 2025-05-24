import clientModel from "@/models/Clients";
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { hash } from "bcryptjs";

export async function POST(request: any) {
  const user = await currentUser();
  const global_user_email: any | null | undefined =
    user?.emailAddresses[0]?.emailAddress;

  if (!user || !global_user_email) {
    console.error("Unauthorized: No user or email found", { user, email: global_user_email });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    console.log("Received request body:", body); // Debug log
    console.log("User email:", global_user_email); // Debug log

    const existingModel = await clientModel.findOne({ email: global_user_email });
    console.log("Existing model:", existingModel ? "Found" : "Not found"); // Debug log

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
      console.log("Updated model:", updatedModel); // Debug log
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

      console.log("Creating new client:", new_client); // Debug log

      try {
        // Save the client
        const savedClient = await new_client.save();
        console.log("Client saved successfully:", savedClient);

        // Verify the saved data immediately
        const verifiedClient = await clientModel.findOne({ email: global_user_email });
        console.log("Verification query result:", verifiedClient);

        if (!verifiedClient) {
          throw new Error("Client not found after save");
        }

        // Verify all required fields
        const requiredFields = {
          firstName: body.firstName,
          lastName: body.lastName,
          email: global_user_email,
          mobileNumber: body.mobileNumber
        };

        const missingFields = Object.entries(requiredFields)
          .filter(([key, value]) => !verifiedClient[key as keyof typeof verifiedClient] || verifiedClient[key as keyof typeof verifiedClient] !== value)
          .map(([key]) => key);

        if (missingFields.length > 0) {
          console.error("Missing or incorrect fields:", missingFields);
          throw new Error(`Profile data verification failed: Missing or incorrect fields: ${missingFields.join(', ')}`);
        }

        console.log("Client created and verified successfully");
        return NextResponse.json({ message: "Success", client: verifiedClient }, { status: 200 });
      } catch (saveError: any) {
        console.error("Error saving client:", saveError);
        throw new Error(`Failed to save client: ${saveError.message}`);
      }
    }

    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (error: any) {
    console.error("Error in API route:", error);
    return NextResponse.json(
      { message: "Error processing request", error: error.message },
      { status: 500 }
    );
  }
}
