import clientModel from "@/models/Clients";
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import connect from "@/db";

/**
 * Client propagation api, used to propagate a specific client's data to a client side code.
 * Returns proper HTTP status codes and structured responses.
 */

interface OrderItem {
  orderId: string;
  paymentId: string;
  amount: number;
  currency: string;
  status: string;
  timestamp: string;
  estimatedDeliveryDate: string;
  items: string[];
  trackingId: string;
  itemStatus: string;
  itemDetails: {
    productId: string;
    size: string;
    quantity: number;
  }[];
  shippingAddress: {
    firstName: string;
    lastName: string;
    streetAddress: string;
    apartment: string;
    city: string;
    phone: string;
    email: string;
  };
}

interface SafeProfile {
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  cart: string[];
  cartQuantities: Record<string, number>;
  cartSizes: Record<string, string>;
  wishlist: string[];
  orders: OrderItem[];
}

export async function GET() {
  const user = await currentUser();
  const clerkId = user?.id;
  const global_user_email = user?.emailAddresses[0]?.emailAddress;

  if (!user || !clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Ensure database connection
    await connect();
    
    // Find the specific user by their clerkId first, then fallback to email
    let database_obj = await clientModel.findOne({ clerkId: clerkId });
    
    // If not found by clerkId, try email (for backward compatibility)
    if (!database_obj && global_user_email) {
      database_obj = await clientModel.findOne({ email: global_user_email });
      
      // If found by email but missing clerkId, update it
      if (database_obj && !database_obj.clerkId) {
        database_obj.clerkId = clerkId;
        await database_obj.save();
      }
    }
    
    if (!database_obj) {
      // Auto-create the missing profile
      const firstName = user.firstName || "User";
      const lastName = user.lastName || "User";
      const email = global_user_email || user.emailAddresses[0]?.emailAddress || "";
      
      if (!email) {
        return NextResponse.json({ error: "No email found for user" }, { status: 400 });
      }
      
      const newClient = new clientModel({
        clerkId: clerkId,
        firstName: firstName,
        lastName: lastName,
        email: email,
        mobileNumber: "Not provided",
        password: "clerk-auth",
        username: firstName || email.split('@')[0],
        cart: [],
        wishlist: [],
        cartQuantities: {},
        cartSizes: {},
        orders: []
      });
      
      try {
        database_obj = await newClient.save();
      } catch (saveError: any) {
        return NextResponse.json({ 
          error: "Failed to create user profile automatically",
          details: saveError.message
        }, { status: 500 });
      }
    }

    // Ensure orders are properly populated and sorted by timestamp
    const orders = (database_obj.orders as OrderItem[]).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    // Convert Maps to objects for JSON serialization
    const cartQuantities = Object.fromEntries(database_obj.cartQuantities || new Map());
    const cartSizes = Object.fromEntries(database_obj.cartSizes || new Map());
    
    // Only return non-sensitive fields
    const safeProfile: SafeProfile = {
      firstName: database_obj.firstName || "",
      lastName: database_obj.lastName || "",
      email: database_obj.email,
      mobileNumber: database_obj.mobileNumber || "",
      cart: database_obj.cart || [],
      cartQuantities,
      cartSizes,
      wishlist: database_obj.wishlist || [],
      orders: orders || []
    };

    return NextResponse.json(safeProfile);
  } catch (error: any) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await currentUser();
  const clerkId = user?.id;

  if (!user || !clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Ensure database connection
    await connect();
    const body = await request.json();
    const { wishlist, cart, cartQuantities, cartSizes, orders } = body;

    // Find and update the user document by clerkId
    const database_obj = await clientModel.findOne({ clerkId: clerkId });
    
    if (!database_obj) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update fields if they exist in the request
    if (wishlist !== undefined) database_obj.wishlist = wishlist;
    if (cart !== undefined) database_obj.cart = cart;
    
    // Convert cartQuantities and cartSizes objects to Maps
    if (cartQuantities !== undefined) {
      database_obj.cartQuantities = new Map(Object.entries(cartQuantities));
    }
    if (cartSizes !== undefined) {
      database_obj.cartSizes = new Map(Object.entries(cartSizes));
    }
    
    // Only update orders if new ones are provided
    if (orders !== undefined && Array.isArray(orders)) {
      // Append new orders while preserving existing ones
      database_obj.orders = [...database_obj.orders, ...orders];
    }

    await database_obj.save();
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
