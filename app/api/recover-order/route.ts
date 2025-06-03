import { NextResponse } from "next/server";
import connect from "@/db";
import clientModel from "@/models/Clients";
import { currentUser } from "@clerk/nextjs/server";

interface RecoveryOrderData {
  orderId: string;
  paymentId: string;
  amount: number;
  userEmail?: string;
  timestamp: string;
  items?: string[];
  itemDetails?: {
    productId: string;
    size: string;
    quantity: number;
  }[];
  shippingAddress?: {
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

    const { orderId, paymentId, amount, userEmail, timestamp, items, itemDetails, shippingAddress } = await request.json() as RecoveryOrderData;
    
    // Validate required fields
    if (!orderId || !paymentId || !amount) {
      return NextResponse.json(
        { error: "Missing required fields: orderId, paymentId, amount" },
        { status: 400 }
      );
    }

    const targetEmail = userEmail || user.emailAddresses[0]?.emailAddress;
    if (!targetEmail) {
      return NextResponse.json(
        { error: "User email not found" },
        { status: 401 }
      );
    }

    // Find the user
    let client = await clientModel.findOne({ email: targetEmail });
    
    if (!client) {
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 }
      );
    }

    // Check if order already exists
    const existingOrder = client.orders.find((order: any) => 
      order.orderId === orderId || order.paymentId === paymentId
    );
    
    if (existingOrder) {
      return NextResponse.json({ 
        message: "Order already exists in database",
        orderId: orderId,
        exists: true
      });
    }

    // Create the order data with available information
    const orderData = {
      orderId,
      paymentId,
      amount,
      currency: 'INR',
      status: 'completed',
      timestamp: timestamp || new Date().toISOString(),
      estimatedDeliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      items: items || [],
      trackingId: "Tracking ID will be provided soon",
      itemStatus: 'processing',
      itemDetails: itemDetails || [],
      shippingAddress: shippingAddress || {
        firstName: '',
        lastName: '',
        streetAddress: '',
        apartment: '',
        city: '',
        phone: '',
        email: targetEmail,
        pin: ''
      }
    };

    // Add the recovered order
    client.orders.push(orderData);
    await client.save();

    console.log(`Order recovered successfully for user: ${targetEmail}, Order ID: ${orderId}`);

    return NextResponse.json({ 
      message: "Order recovered successfully",
      orderId: orderId,
      recovered: true
    });
    
  } catch (error: any) {
    console.error("Error recovering order:", error);
    return NextResponse.json(
      { error: error.message || "Failed to recover order" },
      { status: 500 }
    );
  }
} 