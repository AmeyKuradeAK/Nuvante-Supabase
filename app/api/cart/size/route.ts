import { NextResponse } from "next/server";
import clientModel from "@/models/Clients";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    const global_user_email = user?.emailAddresses[0].emailAddress;
    
    if (!user || !global_user_email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { productId, size } = await request.json();

    if (!productId || !size) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const existingModel = await clientModel.findOne({ email: global_user_email });
    
    if (!existingModel) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Update the size in the cartSizes map
    existingModel.cartSizes.set(productId, size);
    await existingModel.save();

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
    const user = await currentUser();
    const global_user_email = user?.emailAddresses[0].emailAddress;
    
    if (!user || !global_user_email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const existingModel = await clientModel.findOne({ email: global_user_email });
    
    if (!existingModel) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Convert Map to object for JSON serialization
    const sizes = Object.fromEntries(existingModel.cartSizes);

    return NextResponse.json({ sizes });
  } catch (error) {
    console.error("Error fetching sizes:", error);
    return NextResponse.json(
      { error: "Failed to fetch sizes" },
      { status: 500 }
    );
  }
} 