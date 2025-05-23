"use client";

import React, { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, Package, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAlert } from "@/context/AlertContext";

// Add dynamic export to prevent prerendering
export const dynamic = 'force-dynamic';

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showAlert } = useAlert();

  const orderId = searchParams.get("orderId");
  const paymentId = searchParams.get("paymentId");

  useEffect(() => {
    if (!orderId || !paymentId) {
      showAlert("Invalid payment details", "error");
      router.push("/");
    }
  }, [orderId, paymentId, router, showAlert]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm p-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-20 h-20 mx-auto mb-6 text-green-500"
          >
            <CheckCircle className="w-full h-full" />
          </motion.div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Payment Successful!
          </h1>
          <p className="text-gray-600 mb-8">
            Thank you for your purchase. Your order has been confirmed.
          </p>

          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <div className="grid grid-cols-2 gap-4 text-left">
              <div>
                <p className="text-sm text-gray-500">Order ID</p>
                <p className="font-medium">{orderId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Payment ID</p>
                <p className="font-medium">{paymentId}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push("/orders")}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-[#DB4444] text-white rounded-md hover:bg-[#c13a3a] transition-colors"
            >
              <Package className="w-5 h-5" />
              View Order
            </button>
            <button
              onClick={() => router.push("/Products")}
              className="flex items-center justify-center gap-2 px-6 py-3 border border-[#DB4444] text-[#DB4444] rounded-md hover:bg-[#DB4444] hover:text-white transition-colors"
            >
              Continue Shopping
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#DB4444]"></div>
        </div>
      }>
        <PaymentSuccessContent />
      </Suspense>
      <Footer />
    </>
  );
} 