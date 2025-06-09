import { NextRequest, NextResponse } from "next/server";
import couponModel from "@/models/Coupon";
import connect from "@/db";

export async function POST(req: NextRequest) {
  try {
    await connect();

    // Sample coupons for testing
    const sampleCoupons = [
      {
        code: "WELCOME10",
        description: "Welcome discount - 10% off on your first order",
        type: "percentage",
        value: 10,
        minimumOrderAmount: 1000,
        maximumDiscount: 200,
        totalAvailable: 100,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        createdBy: "system",
        isActive: true
      },
      {
        code: "SAVE50",
        description: "Flat Rs. 50 off on orders above Rs. 300",
        type: "fixed",
        value: 50,
        minimumOrderAmount: 300,
        totalAvailable: 50,
        expirationDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        createdBy: "system",
        isActive: true
      },
      {
        code: "MEGA20",
        description: "Mega sale - 20% off with maximum discount of Rs. 500",
        type: "percentage",
        value: 20,
        minimumOrderAmount: 1000,
        maximumDiscount: 500,
        totalAvailable: 25,
        expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        createdBy: "system",
        isActive: true
      },
      {
        code: "FLAT100",
        description: "Flat Rs. 100 off on orders above Rs. 800",
        type: "fixed",
        value: 100,
        minimumOrderAmount: 800,
        totalAvailable: 30,
        expirationDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
        createdBy: "system",
        isActive: true
      },
      {
        code: "NEWUSER15",
        description: "New user special - 15% off with no minimum order",
        type: "percentage",
        value: 15,
        minimumOrderAmount: 0,
        maximumDiscount: 300,
        totalAvailable: 200,
        expirationDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
        createdBy: "system",
        isActive: true
      }
    ];

    // Check if coupons already exist
    const existingCoupons = await couponModel.find({
      code: { $in: sampleCoupons.map(c => c.code) }
    });

    if (existingCoupons.length > 0) {
      return NextResponse.json({
        message: "Sample coupons already exist",
        existingCoupons: existingCoupons.map(c => c.code)
      });
    }

    // Insert sample coupons
    const createdCoupons = await couponModel.insertMany(sampleCoupons);

    return NextResponse.json({
      success: true,
      message: "Sample coupons created successfully",
      coupons: createdCoupons.map(c => ({
        code: c.code,
        description: c.description,
        type: c.type,
        value: c.value,
        minimumOrderAmount: c.minimumOrderAmount,
        totalAvailable: c.totalAvailable,
        expirationDate: c.expirationDate
      }))
    }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({
      error: "Failed to create sample coupons",
      details: error.message
    }, { status: 500 });
  }
} 