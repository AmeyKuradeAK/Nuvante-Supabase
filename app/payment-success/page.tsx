"use client";

import React, { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, Package, ArrowRight, Home, ShoppingBag, Truck, Calendar, CreditCard } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAlert } from "@/context/AlertContext";
import Image from "next/image";

const logo = "/logo.png";

// Add dynamic export to prevent prerendering
export const dynamic = 'force-dynamic';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showAlert } = useAlert();

  const orderId = searchParams.get("orderId");
  const paymentId = searchParams.get("paymentId");

  useEffect(() => {
    if (!orderId || !paymentId) {
      showAlert("Invalid payment details", "error");
      router.push("/");
      return;
    }
  }, [orderId, paymentId, router, showAlert]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl p-6 sm:p-8"
        >
          {/* Success Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
            >
              <CheckCircle className="w-12 h-12 text-white" />
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3"
            >
              Payment Successful!
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-600 text-lg"
            >
              Thank you for your purchase. Your order has been confirmed.
            </motion.p>
          </div>

          <div className="space-y-8">
            {/* Order Details Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-green-50 to-white p-6 rounded-xl border border-green-100"
            >
              <h2 className="font-semibold text-xl text-gray-800 mb-6 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-green-500" />
                Order Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="bg-white p-4 rounded-lg shadow-sm border border-green-50"
                >
                  <p className="text-sm text-gray-500">Order Number</p>
                  <p className="font-medium text-gray-800 mt-1">{orderId}</p>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="bg-white p-4 rounded-lg shadow-sm border border-green-50"
                >
                  <p className="text-sm text-gray-500">Payment ID</p>
                  <p className="font-medium text-gray-800 mt-1">{paymentId}</p>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="bg-white p-4 rounded-lg shadow-sm border border-green-50"
                >
                  <p className="text-sm text-gray-500">Estimated Delivery</p>
                  <p className="font-medium text-green-600 mt-1">
                    {new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </p>
                </motion.div>
              </div>
            </motion.div>

            {/* What's Next Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-br from-green-50 to-white p-6 rounded-xl border border-green-100"
            >
              <h2 className="font-semibold text-xl text-gray-800 mb-6 flex items-center gap-2">
                <Truck className="w-5 h-5 text-green-500" />
                What's Next?
              </h2>
              <div className="space-y-6">
                <motion.div 
                  whileHover={{ x: 5 }}
                  className="flex items-start gap-4 bg-white p-4 rounded-lg shadow-sm border border-green-50"
                >
                  <div className="bg-green-100 p-2 rounded-full">
                    <Package className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Order Processing</p>
                    <p className="text-sm text-gray-600 mt-1">
                      We're preparing your order for shipment.
                    </p>
                  </div>
                </motion.div>
                <motion.div 
                  whileHover={{ x: 5 }}
                  className="flex items-start gap-4 bg-white p-4 rounded-lg shadow-sm border border-green-50"
                >
                  <div className="bg-green-100 p-2 rounded-full">
                    <Calendar className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Order Tracking</p>
                    <p className="text-sm text-gray-600 mt-1">
                      You'll receive tracking information once your order ships.
                    </p>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-4 pt-4"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push("/")}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-md"
              >
                <Home className="w-5 h-5" />
                Return to Home
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push("/orders")}
                className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-green-500 text-green-600 px-6 py-3 rounded-xl hover:bg-green-50 transition-all duration-300 shadow-md"
              >
                <ShoppingBag className="w-5 h-5" />
                View Orders
              </motion.button>
            </motion.div>
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
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center">
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[80px] h-[80px] rounded-full border-4 border-green-500 border-t-transparent animate-spin"></div>
            </div>
            <Image 
              src={logo} 
              alt="preloader" 
              width={60} 
              height={60}
              className="relative z-10"
              style={{ background: 'transparent' }}
            />
          </div>
        </div>
      }>
        <PaymentSuccessContent />
      </Suspense>
      <Footer />
    </>
  );
} 