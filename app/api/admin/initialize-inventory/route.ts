import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { initializeInventory, initializeInventoryWithSampleData, resetAllInventory } from "@/utils/initializeInventory";

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    
    // Basic admin check - enhance this based on your admin system
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, options } = body;

    let result;

    switch (action) {
      case 'initialize':
        result = await initializeInventory(options);
        break;
      
      case 'initialize_sample':
        result = await initializeInventoryWithSampleData();
        break;
      
      case 'reset_all':
        result = await resetAllInventory();
        break;
      
      default:
        return NextResponse.json({
          error: "Invalid action. Supported actions: initialize, initialize_sample, reset_all"
        }, { status: 400 });
    }

    return NextResponse.json({
      success: result.success,
      message: result.success ? "Operation completed successfully" : "Operation failed",
      details: result
    });

  } catch (error: any) {
    console.error("Error in inventory initialization:", error);
    return NextResponse.json({
      error: "Failed to execute inventory operation",
      details: error.message
    }, { status: 500 });
  }
} 