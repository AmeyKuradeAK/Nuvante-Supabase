import { NextResponse } from "next/server";
import { verifyPayment } from "@/utils/razorpay";
import { currentUser } from "@clerk/nextjs/server";
import clientModel from "@/models/Clients";

export async function POST(request: Request) {
  const user = await currentUser();
  const global_user_email = user?.emailAddresses[0].emailAddress;
  if (!user || !global_user_email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData } = await request.json();

    // 1. Verify signature
    const isValid = verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    // 2. Add order to user's orders array
    await clientModel.updateOne(
      { email: global_user_email },
      { $push: { orders: orderData } }
    );

    return NextResponse.json({ message: "Order verified and saved" }, { status: 200 });
  } catch (error) {
    console.error("Error in verify-payment route:", error);
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 });
  }
} 