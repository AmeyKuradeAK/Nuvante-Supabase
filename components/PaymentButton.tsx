"use client";

import { useState, useContext, useEffect } from 'react';
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
  onPrePayment?: (orderId: string) => Promise<void>;
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
  phoneNumber?: string;
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
  onPrePayment,
  className = '',
  children,
  disabled = false,
  phoneNumber,
}: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const router = useRouter();
  const { user } = useUser();
  const { showAlert } = useAlert();
  const globalContext = useContext(GlobalContext);

  if (!globalContext) {
    throw new Error('PaymentButton must be used within GlobalContextProvider');
  }

  useEffect(() => {
    // Load Razorpay script
    const loadRazorpay = () => {
      return new Promise((resolve, reject) => {
        if (window.Razorpay) {
          setRazorpayLoaded(true);
          resolve(true);
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => {
          setRazorpayLoaded(true);
          resolve(true);
        };
        script.onerror = () => {
          reject(new Error('Failed to load Razorpay script'));
        };
        document.body.appendChild(script);
      });
    };

    loadRazorpay().catch(error => {
      console.error('Error loading Razorpay:', error);
      showAlert('Failed to load payment system. Please try again.', 'error');
    });
  }, [showAlert]);

  const handlePayment = async () => {
    if (loading) return;
    if (!razorpayLoaded) {
      showAlert('Please wait while we load the payment system...', 'warning');
      return;
    }
    if (!user) {
      showAlert('Please sign in to make a payment', 'warning');
      router.push('/sign-in');
      return;
    }

    setLoading(true);

    try {
      // Basic validation
      if (!amount || amount <= 0) {
        throw new Error('Please enter a valid amount');
      }

      // Create order on server without notes
      const response = await fetch('/api/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
          receipt
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unable to process payment. Please try again.');
      }

      if (!data.orderId) {
        throw new Error('Payment initialization failed. Please try again.');
      }

      // Call onPrePayment callback if provided
      if (onPrePayment) {
        try {
          await onPrePayment(data.orderId);
        } catch (prePaymentError) {
          console.warn('Pre-payment check failed:', prePaymentError);
        }
      }

      const contactNumber = phoneNumber || user.phoneNumbers[0]?.phoneNumber || '';

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: 'Nuvante',
        description: 'Payment for your order',
        order_id: data.orderId,
        handler: async function (response: any) {
          try {
            if (!response.razorpay_payment_id) {
              throw new Error('Payment verification failed');
            }
            if (onSuccess) {
              onSuccess(response.razorpay_payment_id, data.orderId);
            }
          } catch (error) {
            console.error('Payment verification failed:', error);
            if (onError) {
              onError(error);
            }
            showAlert('Payment verification failed. Please contact support with your order ID.', 'error');
          }
        },
        prefill: {
          name: `${user.firstName} ${user.lastName}`,
          email: user.emailAddresses[0]?.emailAddress,
          contact: contactNumber
        },
        theme: {
          color: '#DB4444'
        },
        modal: {
          ondismiss: async function() {
            try {
              // Cancel the order when payment is dismissed
              await fetch('/api/cancel-payment', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  orderId: data.orderId
                }),
              });
              showAlert("Payment cancelled", "warning");
            } catch (error) {
              console.error('Error cancelling payment:', error);
            }
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      console.error('Payment initialization failed:', error);
      if (onError) {
        onError(error);
      }
      showAlert(error.message || 'Payment initialization failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading || !razorpayLoaded || disabled}
      className={`${className} ${(loading || !razorpayLoaded || disabled) ? 'opacity-50 cursor-not-allowed' : ''}`}
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