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
  const global_user_email = user?.emailAddresses[0]?.emailAddress;

  console.log("=== PROPAGATION_CLIENT DEBUG ===");
  console.log("Clerk user object:", user ? "Present" : "Missing");
  console.log("User email:", global_user_email);
  console.log("User ID:", user?.id);
  console.log("Email addresses:", user?.emailAddresses?.map(e => e.emailAddress));

  if (!user || !global_user_email) {
    console.error("Unauthorized: No user or email found", { user, email: global_user_email });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Ensure database connection
    await connect();
    console.log("Database connected successfully");
    
    // Find the specific user by their email
    const database_obj = await clientModel.findOne({ email: global_user_email });
    console.log("Database query result:", database_obj ? "User found" : "User not found");
    
    if (!database_obj) {
      console.log("=== USER NOT FOUND DEBUG ===");
      console.log("Searching for email:", global_user_email);
      
      // Let's check if there are any users in the database at all
      const totalUsers = await clientModel.countDocuments();
      console.log("Total users in database:", totalUsers);
      
      // Let's check if there's a user with a similar email (case sensitivity issue?)
      const similarUsers = await clientModel.find({ 
        email: { $regex: global_user_email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } 
      });
      console.log("Similar email users found:", similarUsers.length);
      
      if (similarUsers.length > 0) {
        console.log("Similar users:", similarUsers.map(u => ({ email: u.email, firstName: u.firstName })));
      }
      
      // Check if there are any users with this email but different casing
      const allUsers = await clientModel.find({}, { email: 1, firstName: 1 }).limit(10);
      console.log("Sample users in database:", allUsers);
      
      return NextResponse.json({ 
        error: "User profile not found. Please complete your signup process.",
        debug: {
          searchedEmail: global_user_email,
          totalUsers,
          similarUsersCount: similarUsers.length
        }
      }, { status: 404 });
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

    console.log("=== RETURNING PROFILE ===");
    console.log("Profile data:", {
      email: safeProfile.email,
      firstName: safeProfile.firstName,
      lastName: safeProfile.lastName,
      mobileNumber: safeProfile.mobileNumber
    });
    
    return NextResponse.json(safeProfile);
  } catch (error: any) {
    console.error("Error in propagation_client route:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await currentUser();
  const global_user_email = user?.emailAddresses[0]?.emailAddress;

  if (!user || !global_user_email) {
    console.error("Unauthorized: No user or email found", { user, email: global_user_email });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Ensure database connection
    await connect();
    const body = await request.json();
    const { wishlist, cart, cartQuantities, cartSizes, orders } = body;

    // Find and update the user document
    const database_obj = await clientModel.findOne({ email: global_user_email });
    
    if (!database_obj) {
      console.error("No user found for email:", global_user_email);
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
    console.log("Updated profile for user:", global_user_email);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error in propagation_client POST route:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
