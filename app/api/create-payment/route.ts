import { NextResponse } from 'next/server';
import { createOrder } from '@/utils/razorpay';
import { currentUser } from '@clerk/nextjs/server';

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { amount, currency, receipt, notes } = body;

    const order = await createOrder({
      amount,
      currency,
      receipt,
      notes: {
        ...notes,
        userId: user.id,
      },
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