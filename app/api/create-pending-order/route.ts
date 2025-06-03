import { NextResponse } from "next/server";
import connect from "@/db";
import clientModel from "@/models/Clients";
import { currentUser } from "@clerk/nextjs/server";

interface PendingOrderData {
  orderId: string;
  amount: number;
  currency: string;
  status: 'pending';
  timestamp: string;
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
  expiresAt: string;
}

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connect();

    const {
      orderId,
      amount,
      currency,
      items,
      itemDetails,
      shippingAddress
    } = await request.json();

    const userEmail = user.emailAddresses[0]?.emailAddress;
    if (!userEmail) {
      return NextResponse.json({ error: "User email not found" }, { status: 400 });
    }

    // Find or create user
    let client = await clientModel.findOne({ email: userEmail });
    if (!client) {
      client = new clientModel({
        email: userEmail,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        wishlist: [],
        cart: [],
        orders: []
      });
    }

    // Create pending order with expiration (30 minutes)
    const pendingOrder: PendingOrderData = {
      orderId,
      amount,
      currency,
      status: 'pending',
      timestamp: new Date().toISOString(),
      items,
      itemDetails,
      shippingAddress,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
    };

    // Check if order already exists
    const existingOrder = client.orders.find((order: any) => order.orderId === orderId);
    if (existingOrder) {
      return NextResponse.json({ 
        message: "Order already exists",
        isDuplicate: true,
        existingOrder 
      });
    }

    // Add pending order
    client.orders.push(pendingOrder);
    await client.save();

    return NextResponse.json({
      message: "Pending order created successfully",
      orderId,
      success: true
    });

  } catch (error: any) {
    console.error("Error creating pending order:", error);
    return NextResponse.json(
      { error: "Failed to create pending order", details: error.message },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve pending order
export async function GET(request: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json({ error: "Order ID required" }, { status: 400 });
    }

    await connect();

    const userEmail = user.emailAddresses[0]?.emailAddress;
    const client = await clientModel.findOne({ email: userEmail });

    if (!client) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const order = client.orders.find((order: any) => order.orderId === orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order, success: true });

  } catch (error: any) {
    console.error("Error retrieving pending order:", error);
    return NextResponse.json(
      { error: "Failed to retrieve order", details: error.message },
      { status: 500 }
    );
  }
} 