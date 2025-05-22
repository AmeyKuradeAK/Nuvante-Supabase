import Razorpay from 'razorpay';
import crypto from 'crypto';

// Initialize Razorpay instance
export const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Types for payment data
export interface PaymentData {
  amount: number;
  currency: string;
  receipt: string;
  notes?: {
    [key: string]: string;
  };
}

// Create order function
export const createOrder = async (paymentData: PaymentData) => {
  try {
    const order = await razorpay.orders.create({
      amount: paymentData.amount * 100, // Razorpay expects amount in paise
      currency: paymentData.currency,
      receipt: paymentData.receipt,
      notes: paymentData.notes,
    });
    return order;
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw error;
  }
};

// Verify payment signature
export function verifyPayment(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET!;
  const body = orderId + '|' + paymentId;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  return expectedSignature === signature;
} 