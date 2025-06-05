"use client";
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

export default function Page() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-16">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Delivery Policy</h1>
            <p className="text-lg text-gray-600">
              Fast, reliable, and secure delivery to your doorstep.
              Learn about our shipping process and delivery timelines.
            </p>
          </motion.div>

          {/* Main Content */}
          <div className="space-y-12">
            {/* Delivery Options */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm p-8"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-[#DB4444] rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-[#DB4444]">Delivery Options</h2>
              </div>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-[#DB4444] rounded-full flex items-center justify-center mt-1">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold text-gray-800">Standard Delivery</h3>
                    <p className="text-gray-600">4-7 business days</p>
                    <p className="text-sm text-gray-500">Free shipping on orders above ₹2500</p>
                  </div>
                </div>
              </div>
            </motion.section>
            {/* Delivery Process */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-sm p-8"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-[#DB4444] rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-[#DB4444]">Delivery Process</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-[#DB4444] mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-gray-800">Order Confirmation</h3>
                    <p className="text-gray-600">You'll receive an email confirmation with your order details.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-[#DB4444] mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-gray-800">Processing</h3>
                    <p className="text-gray-600">Orders are processed within 24 hours of placement.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-[#DB4444] mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-gray-800">Shipping</h3>
                    <p className="text-gray-600">Track your order with the provided tracking number.</p>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Delivery Coverage */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-lg shadow-sm p-8"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-[#DB4444] rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-[#DB4444]">Delivery Coverage</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-[#DB4444] mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-gray-800">Pan India Delivery</h3>
                    <p className="text-gray-600">We deliver to all major cities and remote locations across India.</p>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg mt-4">
                  <p className="text-sm text-gray-500">
                    Note: Delivery times may vary for remote locations. Please check the estimated delivery time during checkout.
                  </p>
                </div>
              </div>
            </motion.section>

            {/* Important Information */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-lg shadow-sm p-8"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-[#DB4444] rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-[#DB4444]">Important Information</h2>
              </div>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-[#DB4444] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Orders placed after 2 PM will be processed the next business day
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-[#DB4444] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Delivery times exclude weekends and public holidays
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-[#DB4444] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Please ensure correct delivery address at checkout
                </li>
              </ul>
            </motion.section>

            {/* Contact Information */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-lg shadow-sm p-8"
            >
              <h2 className="text-2xl font-bold mb-4 text-[#DB4444]">Need Help?</h2>
              <p className="text-gray-600 mb-4">
                For any delivery-related queries, please contact our customer support:
              </p>
              <div className="space-y-2 text-gray-600">
                <p>Email: support@nuvante.in</p>
                <p>Phone: +91 9899044148</p>
                <p>Hours: Monday to Friday, 10 AM - 6 PM IST</p>
              </div>
              <div className="mt-4">
                <a href="/support" className="inline-flex items-center text-[#DB4444] hover:text-black font-medium transition-colors duration-300">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Visit Support Center
                </a>
              </div>
            </motion.section>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
} 