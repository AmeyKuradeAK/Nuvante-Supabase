'use client';

import React from "react";
import { useRouter } from "next/navigation";
import { useAlert } from "@/context/AlertContext";
import { GlobalContext } from "@/context/Global";
import { useContext } from "react";

interface PaymentButtonProps {
  amount: number;
  currency: string;
  receipt: string;
  className?: string;
  children: React.ReactNode;
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  amount,
  currency,
  receipt,
  className,
  children,
}) => {
  const router = useRouter();
  const { showAlert } = useAlert();
  const globalContext = useContext(GlobalContext);

  if (!globalContext) {
    throw new Error("PaymentButton must be used within GlobalContextProvider");
  }

  const { GlobalCart, clearGlobalCart } = globalContext;

  const handlePayment = async () => {
    try {
      // Create order
      const orderResponse = await fetch("/api/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          currency,
          receipt,
          notes: {
            items: GlobalCart,
          },
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderData.error || "Failed to create order");
      }

      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Nuvante India",
        description: "Payment for your order",
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            // Verify payment
            const verifyResponse = await fetch("/api/verify-payment", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderData: {
                  orderId: response.razorpay_order_id,
                  paymentId: response.razorpay_payment_id,
                  amount: amount,
                  currency: currency,
                  status: "completed",
                  timestamp: new Date().toISOString(),
                  items: GlobalCart,
                },
              }),
            });

            const verifyData = await verifyResponse.json();

            if (!verifyResponse.ok) {
              throw new Error(verifyData.error || "Payment verification failed");
            }

            if (verifyData.success) {
              clearGlobalCart();
              // Redirect to success page with order details
              router.push(`/payment-success?orderId=${verifyData.orderId}&paymentId=${verifyData.paymentId}`);
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            showAlert("Payment verification failed", "error");
          }
        },
        prefill: {
          name: "Customer",
          email: "customer@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#DB4444",
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);
      showAlert("Failed to initiate payment", "error");
    }
  };

  return (
    <button onClick={handlePayment} className={className}>
      {children}
    </button>
  );
};

export default PaymentButton; 