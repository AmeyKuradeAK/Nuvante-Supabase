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

    // First check if user exists
    const existingModel = await clientModel.findOne({ email: global_user_email });
    console.log("Existing model:", existingModel ? "Found" : "Not found"); // Debug log

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
      console.log("Updated model:", updatedModel); // Debug log
      return NextResponse.json({ message: "Success", client: updatedModel }, { status: 200 });
    } else {
      // Create new client with only the provided data
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
          firstName: body.firstName || "",
          lastName: body.lastName || "",
          email: global_user_email,
          mobileNumber: body.mobileNumber || ""
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
  } catch (error: any) {
    console.error("Error in API route:", error);
    return NextResponse.json(
      { message: "Error processing request", error: error.message },
      { status: 500 }
    );
  }
}
