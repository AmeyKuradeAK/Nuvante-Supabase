import clientModel from "@/models/Clients";
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

export async function GET() {
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
    const quantities = Object.fromEntries(existingModel.cartQuantities);

    return NextResponse.json({ quantities });
  } catch (error) {
    console.error("Error fetching cart quantities:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 