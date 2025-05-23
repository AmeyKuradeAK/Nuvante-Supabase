import clientModel from "@/models/Clients";
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

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

  if (!user || !global_user_email) {
    console.error("Unauthorized: No user or email found", { user, email: global_user_email });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Find the specific user by their email
    const database_obj = await clientModel.findOne({ email: global_user_email });
    
    if (!database_obj) {
      console.log("No user found for email:", global_user_email);
      return NextResponse.json({ 
        firstName: "",
        lastName: "",
        email: global_user_email,
        mobileNumber: "",
        cart: [],
        cartQuantities: {},
        cartSizes: {},
        wishlist: [], 
        orders: [] 
      }, { status: 200 });
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

    console.log("Returning profile for user:", global_user_email);
    return NextResponse.json(safeProfile);
  } catch (error: any) {
    console.error("Error in propagation_client route:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
