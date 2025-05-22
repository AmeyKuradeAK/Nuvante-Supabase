'use client';

import { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { GlobalContext } from '@/context/Global';
import { useAlert } from '@/context/AlertContext';

interface PaymentButtonProps {
  amount: number;
  currency?: string;
  receipt: string;
  notes?: { [key: string]: string };
  onSuccess?: (response: any) => void;
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
    if (!user) {
      showAlert('Please sign in to make a payment', 'warning');
      router.push('/sign-in');
      return;
    }

    try {
      setLoading(true);

      // Create order
      const response = await fetch('/api/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
          receipt,
          notes: {
            ...notes,
            userId: user.id,
            email: user.emailAddresses[0]?.emailAddress,
            name: `${user.firstName} ${user.lastName}`,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment');
      }

      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount * 100,
        currency,
        name: 'Nuvante',
        description: 'Payment for your order',
        order_id: data.orderId,
        handler: function (response: any) {
          // Add order to global context
          const orderData = {
            orderId: data.orderId,
            paymentId: response.razorpay_payment_id,
            amount,
            currency,
            status: 'completed',
            timestamp: new Date().toISOString(),
            items: globalContext.GlobalCart,
          };
          
          // Update orders in global context
          globalContext.changeGlobalOrders(orderData);
          
          // Clear cart after successful payment
          globalContext.GlobalCart.forEach(item => {
            globalContext.changeGlobalCart(item);
          });
          
          if (onSuccess) {
            onSuccess(response);
          }
          
          showAlert('Payment successful!', 'success');
          router.push('/orders');
        },
        prefill: {
          name: `${user.firstName} ${user.lastName}`,
          email: user.emailAddresses[0]?.emailAddress,
          contact: user.phoneNumbers[0]?.phoneNumber || '',
        },
        theme: {
          color: '#DB4444',
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      showAlert('Payment failed. Please try again.', 'error');
      if (onError) {
        onError(error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className={`${className} ${
        loading ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {loading ? 'Processing...' : children}
    </button>
  );
} 