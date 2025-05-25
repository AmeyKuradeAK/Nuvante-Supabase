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
    console.log("Received request body:", body);

    // First check if user exists
    const existingModel = await clientModel.findOne({ email: global_user_email });
    console.log("Existing model:", existingModel ? "Found" : "Not found");

    if (existingModel) {
      // Update only the fields that are provided in the request
      const updates: any = {};
      
      // Only update fields that are explicitly provided
      if (body.firstName !== undefined) updates.firstName = body.firstName;
      if (body.lastName !== undefined) updates.lastName = body.lastName;
      if (body.mobileNumber !== undefined) updates.mobileNumber = body.mobileNumber;
      if (body.cart !== undefined) updates.cart = body.cart;
      if (body.wishlist !== undefined) updates.wishlist = body.wishlist;
      if (body.cartQuantities !== undefined) updates.cartQuantities = body.cartQuantities;
      if (body.cartSizes !== undefined) updates.cartSizes = body.cartSizes;
      if (body.orders !== undefined) updates.orders = body.orders;

      // Only update password if explicitly provided and not "existing"
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
      return NextResponse.json({ message: "Success", client: updatedModel }, { status: 200 });
    } else {
      // Create new client with all required fields
      const hashedPassword = await hash(body.password || "default", 12);
      
      const new_client = new clientModel({
        username: body.firstName || "",
        email: global_user_email,
        firstName: body.firstName || "",
        lastName: body.lastName || "",
        password: hashedPassword,
        mobileNumber: body.mobileNumber || "",
        cart: body.cart || [],
        wishlist: body.wishlist || [],
        cartQuantities: body.cartQuantities || {},
        cartSizes: body.cartSizes || {},
        orders: body.orders || []
      });

      try {
        // Save the client
        const savedClient = await new_client.save();
        console.log("Client saved successfully:", savedClient);

        // Verify the saved data immediately
        const verifiedClient = await clientModel.findOne({ email: global_user_email });
        if (!verifiedClient) {
          throw new Error("Client not found after save");
        }

        // Verify all required fields are present
        if (!verifiedClient.firstName || !verifiedClient.lastName || !verifiedClient.email) {
          throw new Error("Required fields missing after save");
        }

        return NextResponse.json({ message: "Success", client: verifiedClient }, { status: 200 });
      } catch (saveError: any) {
        console.error("Error saving client:", saveError);
        throw new Error(`Failed to save client: ${saveError.message}`);
      }
    }
  } catch (error: any) {
    console.error("Error in API route:", error);
    return NextResponse.json(
      { message: "Error processing request", error: error.message },
      { status: 500 }
    );
  }
}
