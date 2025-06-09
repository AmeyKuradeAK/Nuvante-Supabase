import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import clientModel from "@/models/Clients";
import connect from "@/db";

// This is the webhook secret from your Clerk dashboard
const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  if (!webhookSecret) {
    console.error("CLERK_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  // Get the headers
  const headerPayload = req.headers;
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error("Missing svix headers");
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  // Get the body
  const payload = await req.text();

  // Create a new Svix instance with your secret
  const wh = new Webhook(webhookSecret);

  let evt: any;

  // Verify the payload with the headers
  try {
    evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  // Handle the webhook
  const eventType = evt.type;
  console.log(`Received webhook: ${eventType}`);

  if (eventType === "user.created") {
    try {
      await connect();
      
      const { id, email_addresses, first_name, last_name, phone_numbers, public_metadata, unsafe_metadata } = evt.data;
      
      // Get primary email
      const primaryEmail = email_addresses?.find((email: any) => email.id === evt.data.primary_email_address_id);
      const emailAddress = primaryEmail?.email_address || email_addresses?.[0]?.email_address;
      
      // Get primary phone number if available
      const primaryPhone = phone_numbers?.find((phone: any) => phone.id === evt.data.primary_phone_number_id);
      const phoneNumber = primaryPhone?.phone_number || phone_numbers?.[0]?.phone_number;
      
      // Extract names from different possible sources
      const firstName = first_name || public_metadata?.firstName || unsafe_metadata?.firstName;
      const lastName = last_name || public_metadata?.lastName || unsafe_metadata?.lastName;
      
      // Check if phone is in metadata
      const mobileNumber = phoneNumber || public_metadata?.phone || unsafe_metadata?.phone;
      
      if (!emailAddress) {
        console.error("No email address found for user");
        return NextResponse.json({ error: "No email address found" }, { status: 400 });
      }

      // Check if user already exists
      const existingUser = await clientModel.findOne({ email: emailAddress });
      if (existingUser) {
        return NextResponse.json({ message: "User already exists" }, { status: 200 });
      }

      // Create new user profile with minimal data - user can update later
      const newClient = new clientModel({
        clerkId: id,
        firstName: firstName || emailAddress.split('@')[0] || "User",
        lastName: lastName || "User", 
        email: emailAddress,
        mobileNumber: mobileNumber || "Not provided",
        password: "clerk-auth",
        username: firstName || emailAddress.split('@')[0],
        cart: [],
        wishlist: [],
        cartQuantities: {},
        cartSizes: {},
        orders: []
      });

      const savedClient = await newClient.save();

      return NextResponse.json({ 
        message: "User profile created successfully",
        userId: savedClient._id 
      }, { status: 200 });

    } catch (error: any) {
      return NextResponse.json({ 
        error: "Failed to create user profile",
        details: error.message 
      }, { status: 500 });
    }
  }

  // Handle user updates
  if (eventType === "user.updated") {
    try {
      await connect();
      
      const { id, email_addresses, first_name, last_name, phone_numbers, public_metadata, unsafe_metadata } = evt.data;
      
      // Get primary email
      const primaryEmail = email_addresses?.find((email: any) => email.id === evt.data.primary_email_address_id);
      const emailAddress = primaryEmail?.email_address || email_addresses?.[0]?.email_address;
      
      // Get primary phone number if available
      const primaryPhone = phone_numbers?.find((phone: any) => phone.id === evt.data.primary_phone_number_id);
      const phoneNumber = primaryPhone?.phone_number || phone_numbers?.[0]?.phone_number;
      
      // Extract names from different possible sources
      const firstName = first_name || public_metadata?.firstName || unsafe_metadata?.firstName;
      const lastName = last_name || public_metadata?.lastName || unsafe_metadata?.lastName;
      
      // Check if phone is in metadata
      const mobileNumber = phoneNumber || public_metadata?.phone || unsafe_metadata?.phone;
      
      if (!emailAddress) {
        return NextResponse.json({ error: "No email address found" }, { status: 400 });
      }

      // Update user profile
      const updatedUser = await clientModel.findOneAndUpdate(
        { $or: [{ clerkId: id }, { email: emailAddress }] },
        {
          $set: {
            clerkId: id, // Ensure clerkId is set
            firstName: firstName || "User",
            lastName: lastName || "User",
            email: emailAddress,
            ...(mobileNumber && mobileNumber !== "Not provided" && { mobileNumber: mobileNumber })
          }
        },
        { new: true, upsert: false }
      );

      if (updatedUser) {
        return NextResponse.json({ 
          message: "User profile updated successfully",
          userId: updatedUser._id 
        }, { status: 200 });
      } else {
        // If user doesn't exist, create them
        const newClient = new clientModel({
          clerkId: id,
          firstName: firstName || "User",
          lastName: lastName || "User",
          email: emailAddress,
          mobileNumber: mobileNumber || "Not provided",
          password: "clerk-auth",
          username: firstName || emailAddress.split('@')[0],
          cart: [],
          wishlist: [],
          cartQuantities: {},
          cartSizes: {},
          orders: []
        });

        const savedClient = await newClient.save();
        
        return NextResponse.json({ 
          message: "User profile created during update",
          userId: savedClient._id 
        }, { status: 200 });
      }

    } catch (error: any) {
      return NextResponse.json({ 
        error: "Failed to update user profile",
        details: error.message 
      }, { status: 500 });
    }
  }

  // Handle user deletion
  if (eventType === "user.deleted") {
    try {
      await connect();
      
      const { id } = evt.data;
      
      // Delete user profile
      const deletedUser = await clientModel.findOneAndDelete({ clerkId: id });
      
      if (deletedUser) {
        return NextResponse.json({ 
          message: "User profile deleted successfully" 
        }, { status: 200 });
      } else {
        return NextResponse.json({ 
          message: "User not found" 
        }, { status: 404 });
      }

    } catch (error: any) {
      return NextResponse.json({ 
        error: "Failed to delete user profile",
        details: error.message 
      }, { status: 500 });
    }
  }

  return NextResponse.json({ message: "Webhook received" }, { status: 200 });
} 