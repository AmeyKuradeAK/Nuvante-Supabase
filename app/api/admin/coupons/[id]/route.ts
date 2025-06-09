import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import couponModel from "@/models/Coupon";
import connect from "@/db";

// DELETE - Delete a specific coupon
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await connect();

    const { id: couponId } = await params;
    
    if (!couponId) {
      return NextResponse.json({ 
        error: "Coupon ID is required" 
      }, { status: 400 });
    }

    // Find the coupon first to check if it exists
    const coupon = await couponModel.findById(couponId);
    
    if (!coupon) {
      return NextResponse.json({ 
        error: "Coupon not found" 
      }, { status: 404 });
    }

    // Delete the coupon
    await couponModel.findByIdAndDelete(couponId);

    return NextResponse.json({
      success: true,
      message: `Coupon "${coupon.code}" deleted successfully`
    });

  } catch (error: any) {
    console.error("Error deleting coupon:", error);
    return NextResponse.json({ 
      error: "Failed to delete coupon",
      details: error.message 
    }, { status: 500 });
  }
}

// GET - Get a specific coupon
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await connect();

    const { id: couponId } = await params;
    
    if (!couponId) {
      return NextResponse.json({ 
        error: "Coupon ID is required" 
      }, { status: 400 });
    }

    const coupon = await couponModel.findById(couponId);
    
    if (!coupon) {
      return NextResponse.json({ 
        error: "Coupon not found" 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      coupon
    });

  } catch (error: any) {
    console.error("Error fetching coupon:", error);
    return NextResponse.json({ 
      error: "Failed to fetch coupon",
      details: error.message 
    }, { status: 500 });
  }
} 