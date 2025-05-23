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
  items: string[];
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

export async function GET() {
  const user = await currentUser();
  const global_user_email = user?.emailAddresses[0].emailAddress;

  if (!user || !global_user_email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const database_obj = await clientModel.findOne({ email: global_user_email });
    
    if (!database_obj) {
      return NextResponse.json({ wishlist: [], cart: [], orders: [] }, { status: 200 });
    }

    // Ensure orders are properly populated
    const orders = database_obj.orders || [];
    
    // Only return non-sensitive fields
    const safeProfile = {
      firstName: database_obj.firstName,
      lastName: database_obj.lastName,
      email: database_obj.email,
      address: database_obj.address,
      cart: database_obj.cart,
      wishlist: database_obj.wishlist,
      orders: orders.map((order: OrderItem) => ({
        orderId: order.orderId,
        paymentId: order.paymentId,
        amount: order.amount,
        currency: order.currency,
        status: order.status,
        timestamp: order.timestamp,
        items: order.items,
        shippingAddress: order.shippingAddress
      }))
    };

    return NextResponse.json(safeProfile);
  } catch (error: any) {
    console.error("Error in propagation_client route:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
