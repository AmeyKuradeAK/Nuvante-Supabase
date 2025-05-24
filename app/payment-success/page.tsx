"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, Package, ArrowRight, Home, ShoppingBag } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAlert } from "@/context/AlertContext";

// Add dynamic export to prevent prerendering
export const dynamic = 'force-dynamic';

const PaymentSuccessPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showAlert } = useAlert();
  const [countdown, setCountdown] = useState(5);

  const orderId = searchParams.get("orderId");
  const paymentId = searchParams.get("paymentId");

  useEffect(() => {
    if (!orderId || !paymentId) {
      showAlert("Invalid payment details", "error");
      router.push("/");
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/orders");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [orderId, paymentId, router, showAlert]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-lg shadow-sm p-6 sm:p-8"
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle className="w-10 h-10 text-green-500" />
              </motion.div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                Payment Successful!
              </h1>
              <p className="text-gray-600">
                Thank you for your purchase. Your order has been confirmed.
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-r from-[#DB4444]/5 to-transparent p-4 rounded-lg">
                <h2 className="font-semibold text-gray-800 mb-4">Order Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded-md shadow-sm">
                    <p className="text-sm text-gray-600">Order Number</p>
                    <p className="font-medium text-gray-800">{orderId}</p>
                  </div>
                  <div className="bg-white p-3 rounded-md shadow-sm">
                    <p className="text-sm text-gray-600">Payment ID</p>
                    <p className="font-medium text-gray-800">{paymentId}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-[#DB4444]/5 to-transparent p-4 rounded-lg">
                <h2 className="font-semibold text-gray-800 mb-4">What's Next?</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Package className="w-5 h-5 text-[#DB4444] mt-1" />
                    <div>
                      <p className="font-medium text-gray-800">Order Processing</p>
                      <p className="text-sm text-gray-600">
                        We're preparing your order for shipment.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <ArrowRight className="w-5 h-5 text-[#DB4444] mt-1" />
                    <div>
                      <p className="font-medium text-gray-800">Order Tracking</p>
                      <p className="text-sm text-gray-600">
                        You'll receive tracking information once your order ships.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={() => router.push("/")}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#DB4444] text-white px-6 py-3 rounded-md hover:bg-black transition-colors"
                >
                  <Home className="w-5 h-5" />
                  Return to Home
                </button>
                <button
                  onClick={() => router.push("/orders")}
                  className="flex-1 flex items-center justify-center gap-2 bg-white border border-[#DB4444] text-[#DB4444] px-6 py-3 rounded-md hover:bg-[#DB4444] hover:text-white transition-colors"
                >
                  <ShoppingBag className="w-5 h-5" />
                  View Orders
                </button>
              </div>

              <div className="text-center text-sm text-gray-500 mt-6">
                <p>
                  Redirecting to orders page in{" "}
                  <span className="font-semibold text-[#DB4444]">{countdown}</span>{" "}
                  seconds...
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PaymentSuccessPage; 