import { NextResponse } from "next/server";
import connect from "@/db";
import clientModel from "@/models/Clients";
import { currentUser } from "@clerk/nextjs/server";

interface OrderItem {
  orderId: string;
  paymentId: string;
  amount: number;
  currency: string;
  status: string;
  timestamp: string;
  estimatedDeliveryDate: string;
  items: string[];
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
    pin: string;
  };
}

export async function GET() {
  try {
    await connect();
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    const global_user_email = user.emailAddresses[0].emailAddress;
    if (!global_user_email) {
      return NextResponse.json(
        { error: "User email not found" },
        { status: 401 }
      );
    }

    const client = await clientModel.findOne({ email: global_user_email });
    if (!client) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      );
    }

    // Sort orders by timestamp in descending order (newest first)
    const sortedOrders = (client.orders as OrderItem[]).sort((a: OrderItem, b: OrderItem) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return NextResponse.json({ orders: sortedOrders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connect();
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    const global_user_email = user.emailAddresses[0].emailAddress;
    if (!global_user_email) {
      return NextResponse.json(
        { error: "User email not found" },
        { status: 401 }
      );
    }

    const orderData = await request.json() as OrderItem;
    const client = await clientModel.findOne({ email: global_user_email });

    if (!client) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      );
    }

    // Validate required fields
    const requiredFields = ['orderId', 'paymentId', 'amount', 'items', 'itemDetails', 'shippingAddress'];
    for (const field of requiredFields) {
      if (!orderData[field as keyof OrderItem]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Add the new order to the orders array
    client.orders.push(orderData);

    // Clear the cart after successful order
    client.cart = [];
    client.cartQuantities = new Map();
    client.cartSizes = new Map();

    await client.save();

    return NextResponse.json({ 
      message: "Order added successfully",
      orderId: orderData.orderId
    });
  } catch (error: any) {
    console.error("Error adding order:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
} 