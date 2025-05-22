import { NextResponse } from 'next/server';
import { createOrder } from '@/utils/razorpay';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, currency, receipt, notes } = body;

    const order = await createOrder({
      amount,
      currency,
      receipt,
      notes,
    });

    return NextResponse.json({ orderId: order.id });
  } catch (error) {
    console.error('Error in create-payment route:', error);
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
} 