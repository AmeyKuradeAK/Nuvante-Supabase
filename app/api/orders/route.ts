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
  let retryCount = 0;
  const maxRetries = 3;
  
  while (retryCount < maxRetries) {
    try {
      await connect();
      const user = await currentUser();
      
      if (!user) {
        return NextResponse.json(
          { error: "User not authenticated" },
          { status: 401 }
        );
      }

      const global_user_email = user.emailAddresses[0]?.emailAddress;
      if (!global_user_email) {
        return NextResponse.json(
          { error: "User email not found" },
          { status: 401 }
        );
      }

      const orderData = await request.json() as OrderItem;
      
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

      // Find or create client with robust error handling
      let client = await clientModel.findOne({ email: global_user_email });
      
      if (!client) {
        console.log(`Client not found for email: ${global_user_email}, attempting to create new client`);
        
        // Create a new client if not found (fallback for edge cases)
        client = new clientModel({
          email: global_user_email,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          mobileNumber: user.phoneNumbers[0]?.phoneNumber || '',
          cart: [],
          wishlist: [],
          orders: [],
          cartQuantities: new Map(),
          cartSizes: new Map()
        });
        
        await client.save();
        console.log(`Created new client for email: ${global_user_email}`);
      }

      // Check for duplicate orders to prevent double-saving
      const existingOrder = client.orders.find((order: any) => 
        order.orderId === orderData.orderId || order.paymentId === orderData.paymentId
      );
      
      if (existingOrder) {
        console.log(`Order already exists: ${orderData.orderId}`);
        return NextResponse.json({ 
          message: "Order already exists",
          orderId: orderData.orderId,
          isDuplicate: true
        });
      }

      // Ensure orders array exists
      if (!client.orders) {
        client.orders = [];
      }

      // Add the new order to the orders array
      client.orders.push(orderData);

      // Clear the cart after successful order
      client.cart = [];
      client.cartQuantities = new Map();
      client.cartSizes = new Map();

      // Save with error handling
      await client.save();

      console.log(`Order saved successfully for user: ${global_user_email}, Order ID: ${orderData.orderId}`);

      return NextResponse.json({ 
        message: "Order added successfully",
        orderId: orderData.orderId,
        success: true
      });
      
    } catch (error: any) {
      console.error(`Error adding order (attempt ${retryCount + 1}):`, error);
      
      retryCount++;
      
      // If it's the last retry or it's a validation error, return the error
      if (retryCount >= maxRetries || error.name === 'ValidationError') {
        // Log detailed error information for debugging
        console.error("Final error details:", {
          message: error.message,
          stack: error.stack,
          name: error.name,
          retryCount
        });
        
        return NextResponse.json(
          { 
            error: error.message || "Failed to save order after multiple attempts",
            retryCount,
            details: error.name === 'ValidationError' ? error.errors : undefined
          },
          { status: 500 }
        );
      }
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
    }
  }
} 