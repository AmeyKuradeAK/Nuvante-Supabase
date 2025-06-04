import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { currentUser } from '@clerk/nextjs/server';

// Initialize Razorpay with fallback to public key if secret is not available
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Please sign in to make a payment' }, { status: 401 });
    }

    const { amount, currency = 'INR', receipt } = await request.json();

    // Basic validation
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Please enter a valid amount' }, { status: 400 });
    }

    // Create order with retry mechanism
    let retryCount = 0;
    const maxRetries = 2;
    let lastError;

    while (retryCount <= maxRetries) {
      try {
        const order = await razorpay.orders.create({
          amount: Math.round(amount * 100), // Ensure amount is rounded to avoid decimal issues
          currency,
          receipt: receipt || `order_${Date.now()}`
        });

        return NextResponse.json({
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
        });
      } catch (error: any) {
        lastError = error;
        retryCount++;
        
        // If it's a credential error, don't retry
        if (error.error?.description?.includes('key_id') || 
            error.error?.description?.includes('key_secret')) {
          break;
        }
        
        // Wait before retrying
        if (retryCount <= maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    // If we get here, all retries failed
    const errorMessage = lastError?.error?.description || lastError?.message || 'Payment service temporarily unavailable';
    return NextResponse.json({ error: errorMessage }, { status: 500 });

  } catch (error: any) {
    // Handle unexpected errors
    const errorMessage = error?.message || 'An unexpected error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 