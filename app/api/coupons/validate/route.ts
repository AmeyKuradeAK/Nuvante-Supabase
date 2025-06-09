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

    const { couponCode, orderAmount } = await req.json();
    const userEmail = user.emailAddresses[0]?.emailAddress;

    if (!couponCode || !orderAmount) {
      return NextResponse.json({ 
        error: "Coupon code and order amount are required" 
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
        valid: false,
        message: "Invalid coupon code"
      }, { status: 404 });
    }

    // Check if coupon is valid and calculate discount
    const discountResult = coupon.calculateDiscount(orderAmount);

    if (!discountResult.valid) {
      return NextResponse.json({
        valid: false,
        message: discountResult.message
      }, { status: 400 });
    }

    // Check if user has already used this coupon recently (prevent spam)
    const recentUsage = coupon.usageHistory.find((usage: any) => 
      usage.userEmail === userEmail && 
      new Date(usage.usedAt) > new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours
    );

    if (recentUsage) {
      return NextResponse.json({
        valid: false,
        message: "You have already used this coupon recently"
      }, { status: 400 });
    }

    // Return valid coupon with discount details
    return NextResponse.json({
      valid: true,
      coupon: {
        code: coupon.code,
        description: coupon.description,
        type: coupon.type,
        value: coupon.value,
        discount: discountResult.discount,
        remainingUses: coupon.remainingUses,
        expirationDate: coupon.expirationDate
      },
      message: discountResult.message
    });

  } catch (error: any) {
    return NextResponse.json({ 
      error: "Failed to validate coupon",
      details: error.message 
    }, { status: 500 });
  }
} 