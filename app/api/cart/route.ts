import clientModel from "@/models/Clients";
import { NextResponse } from "next/server";
import React from "react";
import { currentUser } from "@clerk/nextjs/server";

// Custom remove function with a filter logic.
// you could also do something like array.splice(0, array.indexOf(victim)).concat(array.indexOf(victim) + 1) (maybe)
function popElement(array: any[], victim: any) {
  const current = array.filter((element) => {
    return element != victim;
  });
  return current;
}

export async function POST(request: any) {
  const user = await currentUser();
  const global_user_email = user?.emailAddresses[0].emailAddress;
  
  if (!user || !global_user_email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    // Validate product ID
    if (!body.identifier || typeof body.identifier !== 'string') {
      return NextResponse.json(
        { error: "Invalid product identifier" },
        { status: 400 }
      );
    }

    const existingModel = await clientModel.findOne({
      email: global_user_email,
    });

    if (!existingModel) {
      console.error("No client record found for authenticated user:", global_user_email);
      return NextResponse.json({ 
        error: "User profile not found. Please complete your signup process." 
      }, { status: 404 });
    }

    if (body.append) {
        if (!existingModel.cart.includes(body.identifier)) {
          existingModel.cart.push(body.identifier);
          // Set default quantity to 1 when adding to cart
          existingModel.cartQuantities.set(body.identifier, 1);
          // Set size if provided
          if (body.size) {
            existingModel.cartSizes.set(body.identifier, body.size);
          }
        }
      } else {
        existingModel.cart = popElement(existingModel.cart, body.identifier);
        // Remove quantity and size when item is removed from cart
        existingModel.cartQuantities.delete(body.identifier);
        existingModel.cartSizes.delete(body.identifier);
      }

      // If cart is empty, clear all quantities and sizes
      if (existingModel.cart.length === 0) {
        existingModel.cartQuantities = new Map();
        existingModel.cartSizes = new Map();
      }

      await existingModel.save();
      return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
      console.error("Error updating cart:", error);
      return NextResponse.json({ 
        error: "Failed to update cart", 
        details: error instanceof Error ? error.message : "Unknown error" 
      }, { status: 500 });
    }
}
