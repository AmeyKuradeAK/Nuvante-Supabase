import { NextResponse } from "next/server";
import connect from "@/db";
import clientModel from "@/models/Clients";
import { cookies } from "next/headers";

export async function GET() {
  try {
    await connect();
    const cookieStore = await cookies();
    const username = cookieStore.get("username")?.value;

    if (!username) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    const client = await clientModel.findOne({ username });
    if (!client) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ orders: client.orders });
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
    const cookieStore = await cookies();
    const username = cookieStore.get("username")?.value;

    if (!username) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    const orderData = await request.json();
    const client = await clientModel.findOne({ username });

    if (!client) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      );
    }

    // Add order date and item details to the order data
    const orderWithDetails = {
      ...orderData,
      orderDate: new Date().toISOString(),
      itemDetails: orderData.items.map((itemId: string) => ({
        productId: itemId,
        size: client.cartSizes.get(itemId) || '',
        quantity: client.cartQuantities.get(itemId) || 1
      }))
    };

    // Add the new order to the orders array
    client.orders.push(orderWithDetails);

    // Clear the cart after successful order
    client.cart = [];
    client.cartQuantities = new Map();
    client.cartSizes = new Map();

    await client.save();

    return NextResponse.json({ message: "Order added successfully" });
  } catch (error) {
    console.error("Error adding order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 