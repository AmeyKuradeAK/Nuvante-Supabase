import { NextRequest, NextResponse } from "next/server";
import connect from "@/db";
import Product from "@/models/Product";

export async function POST(request: NextRequest) {
  try {
    await connect();

    const body = await request.json();
    const { items } = body;

    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: "Invalid items format" },
        { status: 400 }
      );
    }

    const inventoryChecks = [];
    const unavailableItems = [];

    for (const item of items) {
      const { productId, size, quantity } = item;

      if (!productId || !size || !quantity) {
        unavailableItems.push({
          productId,
          reason: "Missing required fields",
          available: false
        });
        continue;
      }

      const product = await Product.findById(productId);
      
      if (!product) {
        unavailableItems.push({
          productId,
          reason: "Product not found",
          available: false
        });
        continue;
      }

      const availability = product.checkAvailability(size, quantity);
      
      if (!availability.available) {
        unavailableItems.push({
          productId,
          productName: product.productName,
          size,
          requestedQuantity: quantity,
          availableQuantity: availability.availableQuantity || 0,
          reason: availability.message,
          available: false
        });
      } else {
        inventoryChecks.push({
          productId,
          productName: product.productName,
          size,
          requestedQuantity: quantity,
          available: true
        });
      }
    }

    const allAvailable = unavailableItems.length === 0;

    return NextResponse.json({
      success: true,
      allAvailable,
      availableItems: inventoryChecks,
      unavailableItems,
      message: allAvailable 
        ? "All items are available" 
        : `${unavailableItems.length} item(s) are not available`
    });

  } catch (error: any) {
    console.error("Error checking inventory:", error);
    return NextResponse.json(
      { 
        error: "Failed to check inventory", 
        details: error.message 
      },
      { status: 500 }
    );
  }
} 