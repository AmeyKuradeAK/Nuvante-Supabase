import clientModel from "@/models/Clients";
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    const global_user_email = user?.emailAddresses[0].emailAddress;
    
    if (!user || !global_user_email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { 
          status: 401,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        }
      );
    }

    const { productId, quantity } = await request.json();

    if (!productId || !quantity) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { 
          status: 400,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        }
      );
    }

    const existingModel = await clientModel.findOne({ email: global_user_email });
    
    if (!existingModel) {
      return NextResponse.json(
        { error: "User not found" },
        { 
          status: 404,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        }
      );
    }

    // Update the quantity in the cartQuantities map
    existingModel.cartQuantities.set(productId, quantity);
    await existingModel.save();

    return NextResponse.json(
      { success: true },
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
  } catch (error) {
    console.error("Error updating cart quantity:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
  }
} 