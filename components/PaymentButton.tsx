"use client";

import { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { GlobalContext } from '@/context/Global';
import { useAlert } from '@/context/AlertContext';

interface PaymentButtonProps {
  amount: number;
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
  onSuccess?: (paymentId: string, orderId: string) => void;
  onError?: (error: any) => void;
  className?: string;
  children: React.ReactNode;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PaymentButton({
  amount,
  currency = 'INR',
  receipt,
  notes,
  onSuccess,
  onError,
  className = '',
  children,
}: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useUser();
  const { showAlert } = useAlert();
  const globalContext = useContext(GlobalContext);

  if (!globalContext) {
    throw new Error('PaymentButton must be used within GlobalContextProvider');
  }

  const handlePayment = async () => {
    if (loading) return;
    setLoading(true);

    try {
      // Create order on server
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
          receipt,
          notes
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const data = await response.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount * 100, // Razorpay expects amount in paise
        currency,
        name: 'Nuvante',
        description: 'Payment for your order',
        order_id: data.orderId,
        handler: async function (response: any) {
          try {
            // Call onSuccess with payment ID and order ID
            if (onSuccess) {
              onSuccess(response.razorpay_payment_id, data.orderId);
            }
          } catch (error) {
            console.error('Payment verification failed:', error);
            if (onError) {
              onError(error);
            }
            showAlert('Payment verification failed. Please contact support.', 'error');
          }
        },
        prefill: {
          name: 'Customer Name',
          email: 'customer@example.com',
          contact: '9999999999'
        },
        theme: {
          color: '#DB4444'
        }
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment initialization failed:', error);
      if (onError) {
        onError(error);
      }
      showAlert('Payment initialization failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className={`${className} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
        </div>
      ) : (
        children
      )}
    </button>
  );
} 