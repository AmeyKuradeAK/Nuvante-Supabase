import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import couponModel from "@/models/Coupon";
import connect from "@/db";

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await connect();

    const { couponCode, orderAmount, orderId } = await req.json();
    const userEmail = user.emailAddresses[0]?.emailAddress;

    if (!couponCode || !orderAmount || !orderId) {
      return NextResponse.json({ 
        error: "Coupon code, order amount, and order ID are required" 
      }, { status: 400 });
    }

    if (!userEmail) {
      return NextResponse.json({ 
        error: "User email not found" 
      }, { status: 400 });
    }

    // Find the coupon
    const coupon = await couponModel.findOne({ 
      code: couponCode.toUpperCase(),
      isActive: true 
    });

    if (!coupon) {
      return NextResponse.json({ 
        success: false,
        message: "Invalid coupon code"
      }, { status: 404 });
    }

    // Validate coupon and calculate discount
    const discountResult = coupon.calculateDiscount(orderAmount);

    if (!discountResult.valid) {
      return NextResponse.json({
        success: false,
        message: discountResult.message
      }, { status: 400 });
    }

    // Use the coupon (increment usage count and add to history)
    await coupon.useCoupon(userEmail, orderAmount, discountResult.discount);

    return NextResponse.json({
      success: true,
      discount: discountResult.discount,
      couponUsed: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        discountApplied: discountResult.discount
      },
      message: "Coupon applied successfully",
      orderId
    });

  } catch (error: any) {
    return NextResponse.json({ 
      error: "Failed to use coupon",
      details: error.message 
    }, { status: 500 });
  }
} 