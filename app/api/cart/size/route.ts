import { NextResponse } from "next/server";
import connect from "@/db";
import mongoose from "mongoose";

// Define the Cart schema
const cartSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, required: true },
  size: { type: String, required: true }
});

// Create or get the Cart model
const Cart = mongoose.models.Cart || mongoose.model('Cart', cartSchema);

export async function POST(request: Request) {
  try {
    await connect();
    const { productId, size } = await request.json();

    // Update the size in the cart collection
    await Cart.findOneAndUpdate(
      { productId: new mongoose.Types.ObjectId(productId) },
      { size },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating size:", error);
    return NextResponse.json(
      { error: "Failed to update size" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    await connect();
    
    // Get all sizes from the cart collection
    const sizes = await Cart.find({}).select('productId size -_id');

    // Convert to the format expected by the frontend
    const sizesMap = sizes.reduce((acc: { [key: string]: string }, curr) => {
      acc[curr.productId.toString()] = curr.size;
      return acc;
    }, {});

    return NextResponse.json({ sizes: sizesMap });
  } catch (error) {
    console.error("Error fetching sizes:", error);
    return NextResponse.json(
      { error: "Failed to fetch sizes" },
      { status: 500 }
    );
  }
} 