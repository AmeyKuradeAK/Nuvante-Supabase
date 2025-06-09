import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import couponModel from "@/models/Coupon";
import connect from "@/db";

// GET - List all coupons
export async function GET(req: NextRequest) {
  try {
    await connect();
    
    const url = new URL(req.url);
    const status = url.searchParams.get('status'); // active, expired, all
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    let query: any = {};
    
    if (status === 'active') {
      query = { 
        isActive: true, 
        expirationDate: { $gt: new Date() } 
      };
    } else if (status === 'expired') {
      query = { 
        $or: [
          { isActive: false },
          { expirationDate: { $lte: new Date() } }
        ]
      };
    }

    const coupons = await couponModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('usageHistory', 'userEmail usedAt discountApplied');

    const total = await couponModel.countDocuments(query);

    return NextResponse.json({
      coupons,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error: any) {
    return NextResponse.json({ 
      error: "Failed to fetch coupons",
      details: error.message 
    }, { status: 500 });
  }
}

// POST - Create new coupon
export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await connect();

    const {
      code,
      description,
      type,
      value,
      minimumOrderAmount,
      maximumDiscount,
      totalAvailable,
      expirationDate
    } = await req.json();

    // Validation
    if (!code || !description || !type || !value || !totalAvailable || !expirationDate) {
      return NextResponse.json({ 
        error: "Missing required fields" 
      }, { status: 400 });
    }

    if (type === 'percentage' && (value < 0 || value > 100)) {
      return NextResponse.json({ 
        error: "Percentage value must be between 0 and 100" 
      }, { status: 400 });
    }

    if (type === 'fixed' && value < 0) {
      return NextResponse.json({ 
        error: "Fixed discount value must be positive" 
      }, { status: 400 });
    }

    if (new Date(expirationDate) <= new Date()) {
      return NextResponse.json({ 
        error: "Expiration date must be in the future" 
      }, { status: 400 });
    }

    // Check if coupon code already exists
    const existingCoupon = await couponModel.findOne({ 
      code: code.toUpperCase() 
    });

    if (existingCoupon) {
      return NextResponse.json({ 
        error: "Coupon code already exists" 
      }, { status: 409 });
    }

    // Create new coupon
    const newCoupon = new couponModel({
      code: code.toUpperCase(),
      description,
      type,
      value,
      minimumOrderAmount: minimumOrderAmount || 0,
      maximumDiscount: maximumDiscount || null,
      totalAvailable,
      expirationDate: new Date(expirationDate),
      createdBy: user.emailAddresses[0]?.emailAddress || user.id,
      isActive: true
    });

    const savedCoupon = await newCoupon.save();

    return NextResponse.json({
      success: true,
      coupon: savedCoupon,
      message: "Coupon created successfully"
    }, { status: 201 });

  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ 
        error: "Coupon code already exists" 
      }, { status: 409 });
    }
    
    return NextResponse.json({ 
      error: "Failed to create coupon",
      details: error.message 
    }, { status: 500 });
  }
} 