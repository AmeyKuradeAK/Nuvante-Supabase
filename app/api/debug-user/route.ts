import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import clientModel from "@/models/Clients";
import connect from "@/db";

export async function GET(req: NextRequest) {
  try {
    // Get current user from Clerk
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await connect();

    // Find user in database
    const dbUser = await clientModel.findOne({ 
      $or: [
        { clerkId: user.id },
        { email: user.emailAddresses[0]?.emailAddress }
      ]
    });

    // Check for potential order-related issues
    const orderIssues = [];
    if (dbUser) {
      // Check if orders array exists and is valid
      if (!dbUser.orders) {
        orderIssues.push("Orders array is missing");
      } else if (!Array.isArray(dbUser.orders)) {
        orderIssues.push("Orders field is not an array");
      }
      
      // Check for corrupted order data
      if (dbUser.orders && Array.isArray(dbUser.orders)) {
        dbUser.orders.forEach((order: any, index: number) => {
          if (!order.orderId) orderIssues.push(`Order ${index}: Missing orderId`);
          if (!order.paymentId) orderIssues.push(`Order ${index}: Missing paymentId`);
          if (!order.amount) orderIssues.push(`Order ${index}: Missing amount`);
        });
      }
      
      // Check cart-related fields
      if (!dbUser.cart) orderIssues.push("Cart array is missing");
      if (!dbUser.cartQuantities) orderIssues.push("CartQuantities is missing");
      if (!dbUser.cartSizes) orderIssues.push("CartSizes is missing");
    }

    // Return debug information
    return NextResponse.json({
      clerk: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        emailAddresses: user.emailAddresses,
        phoneNumbers: user.phoneNumbers,
        publicMetadata: user.publicMetadata,
        privateMetadata: user.privateMetadata,
        unsafeMetadata: user.unsafeMetadata
      },
      database: dbUser ? {
        _id: dbUser._id,
        clerkId: dbUser.clerkId,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        email: dbUser.email,
        mobileNumber: dbUser.mobileNumber,
        username: dbUser.username,
        ordersCount: dbUser.orders ? dbUser.orders.length : 0,
        cartItemsCount: dbUser.cart ? dbUser.cart.length : 0,
        hasCartQuantities: !!dbUser.cartQuantities,
        hasCartSizes: !!dbUser.cartSizes
      } : null,
      issues: {
        userNotInDb: !dbUser,
        namesMismatch: dbUser && (
          dbUser.firstName !== user.firstName || 
          dbUser.lastName !== user.lastName
        ),
        phoneMismatch: dbUser && user.phoneNumbers?.[0] && 
          dbUser.mobileNumber !== user.phoneNumbers[0].phoneNumber,
        emailMismatch: dbUser && 
          dbUser.email !== user.emailAddresses[0]?.emailAddress,
        orderIssues: orderIssues
      },
      recommendations: {
        needsUserSync: !dbUser || orderIssues.length > 0,
        needsOrderFieldRepair: orderIssues.length > 0,
        canPlaceOrders: dbUser && orderIssues.length === 0
      }
    });

  } catch (error: any) {
    return NextResponse.json({ 
      error: "Failed to debug user",
      details: error.message 
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Get current user from Clerk
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await connect();

    const primaryEmail = user.emailAddresses[0]?.emailAddress;
    const primaryPhone = user.phoneNumbers?.[0]?.phoneNumber;

    if (!primaryEmail) {
      return NextResponse.json({ error: "No email found" }, { status: 400 });
    }

    // Update or create user in database with complete order-related fields
    const updatedUser = await clientModel.findOneAndUpdate(
      { $or: [{ clerkId: user.id }, { email: primaryEmail }] },
      {
        $set: {
          clerkId: user.id,
          firstName: user.firstName || "User",
          lastName: user.lastName || "User",
          email: primaryEmail,
          mobileNumber: primaryPhone || "Not provided",
          username: user.firstName || primaryEmail.split('@')[0]
        },
        $setOnInsert: {
          cart: [],
          wishlist: [],
          orders: [],
          cartQuantities: new Map(),
          cartSizes: new Map()
        }
      },
      { new: true, upsert: true }
    );

    // Ensure all required fields exist for order processing
    let needsUpdate = false;
    const updateFields: any = {};

    if (!updatedUser.orders || !Array.isArray(updatedUser.orders)) {
      updateFields.orders = [];
      needsUpdate = true;
    }
    if (!updatedUser.cart || !Array.isArray(updatedUser.cart)) {
      updateFields.cart = [];
      needsUpdate = true;
    }
    if (!updatedUser.cartQuantities) {
      updateFields.cartQuantities = new Map();
      needsUpdate = true;
    }
    if (!updatedUser.cartSizes) {
      updateFields.cartSizes = new Map();
      needsUpdate = true;
    }

    if (needsUpdate) {
      await clientModel.findByIdAndUpdate(updatedUser._id, { $set: updateFields });
    }

    return NextResponse.json({
      message: "User data synced and repaired successfully",
      user: {
        _id: updatedUser._id,
        clerkId: updatedUser.clerkId,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        mobileNumber: updatedUser.mobileNumber
      },
      repaired: needsUpdate ? Object.keys(updateFields) : []
    });

  } catch (error: any) {
    return NextResponse.json({ 
      error: "Failed to sync user",
      details: error.message 
    }, { status: 500 });
  }
} 