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
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Return Policy</h1>
            <p className="text-lg text-gray-600">
              We want you to be completely satisfied with your purchase.
              Here's everything you need to know about our return and refund process.
            </p>
          </motion.div>

          {/* Main Content */}
          <div className="space-y-12">
            {/* Return Window */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm p-8"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-[#DB4444] rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-[#DB4444]">Return Window</h2>
              </div>
              <p className="text-gray-600 mb-4">
                You have 24 hours from the date of delivery to initiate a return.
                This ensures you have enough time to check your purchase while
                maintaining our quality standards.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">
                  Note: The return window may vary for different product categories.
                  Please check the product page for specific details.
                </p>
              </div>
            </motion.section>

            {/* Return Conditions */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-sm p-8"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-[#DB4444] rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-[#DB4444]">Return Conditions</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-[#DB4444] mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-gray-800">Product Condition</h3>
                    <p className="text-gray-600">Items must be unused, unworn, and in their original packaging with all tags attached.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-[#DB4444] mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-gray-800">Documentation</h3>
                    <p className="text-gray-600">Original invoice and return form must be included with the return package.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-[#DB4444] mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-gray-800">Quality Check</h3>
                    <p className="text-gray-600">All returns undergo a quality check to ensure they meet our return criteria.</p>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Refund Process */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-lg shadow-sm p-8"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-[#DB4444] rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-[#DB4444]">Refund Process</h2>
              </div>
              <div className="space-y-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-8 h-8 bg-[#DB4444] rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-gray-600">Return request approval</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-8 h-8 bg-[#DB4444] rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">2</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-gray-600">Quality check of returned item</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-8 h-8 bg-[#DB4444] rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">3</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-gray-600">Refund initiated (7-14 business days)</p>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Non-Returnable Items */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-lg shadow-sm p-8"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-[#DB4444] rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-[#DB4444]">Non-Returnable Items</h2>
              </div>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Personal care items
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Sale items
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Customized products
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
                If you have any questions about our return policy, please contact our customer support:
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
