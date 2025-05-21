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
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Privacy Policy</h1>
            <p className="text-lg text-gray-600">
              Your privacy is important to us. This policy outlines how we collect,
              use, and protect your personal information.
            </p>
          </motion.div>

          {/* Main Content */}
          <div className="space-y-12">
            {/* Introduction */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm p-8"
            >
              <h2 className="text-2xl font-bold mb-4 text-[#DB4444]">Introduction</h2>
              <p className="text-gray-600 mb-4">
                At Nuvante, we are committed to protecting your privacy and ensuring
                the security of your personal information. This Privacy Policy explains
                how we collect, use, and safeguard your data when you use our website
                and services.
              </p>
            </motion.section>

            {/* Information We Collect */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-sm p-8"
            >
              <h2 className="text-2xl font-bold mb-4 text-[#DB4444]">Information We Collect</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#DB4444] flex items-center justify-center mt-1">
                    <span className="text-white text-sm">1</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-800">Personal Information</h3>
                    <p className="text-gray-600">Name, email address, phone number, and shipping address when you create an account or place an order.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#DB4444] flex items-center justify-center mt-1">
                    <span className="text-white text-sm">2</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-800">Payment Information</h3>
                    <p className="text-gray-600">Payment details are securely processed through our payment partners and are not stored on our servers.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#DB4444] flex items-center justify-center mt-1">
                    <span className="text-white text-sm">3</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-800">Usage Data</h3>
                    <p className="text-gray-600">Information about how you interact with our website, including browsing history and product preferences.</p>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* How We Use Your Information */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-lg shadow-sm p-8"
            >
              <h2 className="text-2xl font-bold mb-4 text-[#DB4444]">How We Use Your Information</h2>
              <ul className="space-y-4 text-gray-600">
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-[#DB4444] mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Process and fulfill your orders</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-[#DB4444] mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Communicate with you about your orders and account</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-[#DB4444] mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Improve our products and services</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-[#DB4444] mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Send promotional offers and updates (with your consent)</span>
                </li>
              </ul>
            </motion.section>

            {/* Data Security */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-lg shadow-sm p-8"
            >
              <h2 className="text-2xl font-bold mb-4 text-[#DB4444]">Data Security</h2>
              <p className="text-gray-600 mb-4">
                We implement appropriate security measures to protect your personal
                information from unauthorized access, alteration, disclosure, or
                destruction. These measures include:
              </p>
              <ul className="space-y-4 text-gray-600">
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-[#DB4444] mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Secure SSL encryption for all data transmission</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-[#DB4444] mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Regular security audits and updates</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-[#DB4444] mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Restricted access to personal information</span>
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
              <h2 className="text-2xl font-bold mb-4 text-[#DB4444]">Contact Us</h2>
              <p className="text-gray-600 mb-4">
                If you have any questions about our Privacy Policy, please contact us:
              </p>
              <div className="space-y-2 text-gray-600">
                <p>Email: nuvanteindia@gmail.com</p>
                <p>Phone: +91 9899044148</p>
                <p>Address: New Delhi, India</p>
              </div>
            </motion.section>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
