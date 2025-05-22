"use client";

import React, { useContext } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { GlobalContext } from "@/context/Global";
import { useAlert } from "@/context/AlertContext";
import PaymentButton from "@/components/PaymentButton";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const CheckoutPage = () => {
  const router = useRouter();
  const { showAlert } = useAlert();
  const globalContext = useContext(GlobalContext);

  if (!globalContext) {
    throw new Error("CheckoutPage must be used within GlobalContextProvider");
  }

  const { GlobalCart } = globalContext;

  const calculateTotal = () => {
    return 2997; // Replace with actual calculation
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/" className="text-gray-600 hover:text-[#DB4444]">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/Cart" className="text-gray-600 hover:text-[#DB4444]">Cart</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-[#DB4444]">Checkout</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Billing Details Form */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-8"
            >
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h1 className="text-2xl font-bold mb-6">Billing Details</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name <span className="text-[#DB4444]">*</span>
                    </label>
                    <input
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DB4444] focus:border-transparent transition-all duration-200"
                      type="text"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name <span className="text-[#DB4444]">*</span>
                    </label>
                    <input
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DB4444] focus:border-transparent transition-all duration-200"
                      type="text"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address <span className="text-[#DB4444]">*</span>
                    </label>
                    <input
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DB4444] focus:border-transparent transition-all duration-200"
                      type="text"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Apartment, Floor, etc.
                    </label>
                    <input
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DB4444] focus:border-transparent transition-all duration-200"
                      type="text"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Town/City <span className="text-[#DB4444]">*</span>
                    </label>
                    <input
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DB4444] focus:border-transparent transition-all duration-200"
                      type="text"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number <span className="text-[#DB4444]">*</span>
                    </label>
                    <input
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DB4444] focus:border-transparent transition-all duration-200"
                      type="tel"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address <span className="text-[#DB4444]">*</span>
                    </label>
                    <input
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DB4444] focus:border-transparent transition-all duration-200"
                      type="email"
                      required
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Order Summary */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-4"
            >
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
                <h2 className="text-xl font-bold mb-6">Order Summary</h2>
                <div className="space-y-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({GlobalCart.length} items)</span>
                    <span>Rs. {calculateTotal()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="text-[#DB4444]">Free</span>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>Rs. {calculateTotal()}</span>
                    </div>
                  </div>
                  <div className="pt-4">
                    <PaymentButton
                      amount={calculateTotal()}
                      currency="INR"
                      receipt={`order_${Date.now()}`}
                      className="w-full bg-[#DB4444] text-white py-3 px-6 rounded-md hover:bg-[#c13a3a] transition-colors duration-200 font-medium"
                    >
                      Place Order
                    </PaymentButton>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CheckoutPage;
