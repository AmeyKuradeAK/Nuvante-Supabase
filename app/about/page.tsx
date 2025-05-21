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
        <div className="max-w-7xl mx-auto px-4 py-16">
          {/* Hero Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">About Nuvante</h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Where fashion meets individuality and quality. Founded with a passion for creativity and craftsmanship,
              Nuvante India is more than just a clothing brand—we are a lifestyle that celebrates self-expression,
              sustainability, and style.
            </p>
          </motion.div>

          {/* Main Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Vision Section */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm p-8"
            >
              <h2 className="text-2xl font-bold mb-4 text-[#DB4444]">Our Vision</h2>
              <p className="text-gray-600">
                At Nuvante India, we envision a world where everyone has the freedom
                to showcase their unique personality through fashion. Our goal is to
                provide premium, thoughtfully designed clothing that empowers
                individuals to express their story while staying aligned with modern
                trends.
              </p>
            </motion.div>

            {/* Who We Are Section */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-sm p-8"
            >
              <h2 className="text-2xl font-bold mb-4 text-[#DB4444]">Who We Are</h2>
              <p className="text-gray-600 mb-4">
                Based in the heart of Delhi, India, Nuvante India was born out of a
                desire to bring high-quality, stylish, and premium apparel to people
                who value comfort, durability, and personalization.
              </p>
              <div className="mt-4 border-t pt-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-[#DB4444] rounded-full flex items-center justify-center">
                    <span className="text-white text-xl font-bold">AN</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Alan Noble</h3>
                    <p className="text-sm text-[#DB4444]">Founder</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* What Makes Us Different Section */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-lg shadow-sm p-8"
            >
              <h2 className="text-2xl font-bold mb-4 text-[#DB4444]">What Makes Us Different?</h2>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-[#DB4444] mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <strong className="text-gray-800">Quality You Can Trust</strong>
                    <p className="text-gray-600">We source the finest fabrics to ensure comfort and durability.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-[#DB4444] mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <strong className="text-gray-800">Sustainability</strong>
                    <p className="text-gray-600">We embrace ethical practices to reduce environmental impact.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-[#DB4444] mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <strong className="text-gray-800">Customer-Centric Approach</strong>
                    <p className="text-gray-600">Your satisfaction is at the heart of everything we do.</p>
                  </div>
                </li>
              </ul>
            </motion.div>

            {/* Our Commitment Section */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-lg shadow-sm p-8"
            >
              <h2 className="text-2xl font-bold mb-4 text-[#DB4444]">Our Commitment</h2>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-[#DB4444] mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-gray-600">Delivering exceptional products that exceed expectations.</p>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-[#DB4444] mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-gray-600">Embracing sustainable and ethical business practices.</p>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-[#DB4444] mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-gray-600">Supporting individuality and creativity in every aspect of our designs.</p>
                </li>
              </ul>
            </motion.div>
          </div>

          {/* Join Our Journey Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center mt-16 bg-white rounded-lg shadow-sm p-8"
          >
            <h2 className="text-2xl font-bold mb-4 text-[#DB4444]">Join Our Journey</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-6">
              We are excited to be a part of your wardrobe and story. Explore our
              collections and embrace your unique style.
            </p>
            <div className="flex justify-center items-center space-x-6">
              <a href="https://instagram.com/nuvante.in" className="text-gray-600 hover:text-[#DB4444] transition-colors flex items-center">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="/faq" className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-[#DB4444] hover:bg-[#c13a3a] transition-colors duration-200">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                View FAQs
              </a>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </>
  );
}
