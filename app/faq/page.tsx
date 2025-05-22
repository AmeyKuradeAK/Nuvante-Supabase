"use client";
import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface FAQItem {
  question: string;
  answer: string | string[];
  category: string;
}

const faqData: FAQItem[] = [
  {
    category: "Orders",
    question: "How can I place an order?",
    answer: "You can place an order by browsing our collection, selecting your desired items, choosing your size, and adding them to your cart. Once done, proceed to checkout to complete your purchase. Another way to place an order is through our Instagram Page."
  },
  {
    category: "Orders",
    question: "Can I cancel or modify my order?",
    answer: "Yes, you can cancel or modify your order within 12 hours of placing it, provided it hasn't been shipped. Please contact our customer support team immediately for assistance."
  },
  {
    category: "Orders",
    question: "How do I check the status of my order?",
    answer: "You can track your order status by logging into your account and navigating to the \"My Orders\" section or by contacting our Customer Support."
  },
  {
    category: "Shipping",
    question: "What are the shipping charges?",
    answer: "Shipping charges may vary based on your location and the size of your order. Free shipping is available for orders above ₹2500."
  },
  {
    category: "Shipping",
    question: "How long does delivery take?",
    answer: "Delivery typically takes 4-7 business days, depending on your location. Remote areas may take longer."
  },
  {
    category: "Shipping",
    question: "Do you ship internationally?",
    answer: "Currently, we deliver only within India. International shipping will be announced in the future."
  },
  {
    category: "Returns & Refunds",
    question: "What is your return policy?",
    answer: "Returns are accepted for damaged or defective items within 24 hours of delivery. A valid unboxing video is required for returns."
  },
  {
    category: "Returns & Refunds",
    question: "How do I initiate a return or refund?",
    answer: "Contact Customer Support with your order details and unboxing video. Once approved, we will guide you through the return process."
  },
  {
    category: "Returns & Refunds",
    question: "How long will it take to receive my refund?",
    answer: "Refunds are processed within 7-14 business days after the returned item has been inspected and approved."
  },
  {
    category: "Products & Customization",
    question: "What type of clothing does Nuvante India offer?",
    answer: "We specialize in high-quality, stylish clothing accessories with an option for custom printing. Our collection is designed to offer comfort and style for all occasions."
  },
  {
    category: "Products & Customization",
    question: "Are customized items eligible for return?",
    answer: "Customized items are non-returnable unless they are defective or damaged."
  },
  {
    category: "Payments",
    question: "What payment methods do you accept?",
    answer: "We accept all major payment methods, including credit cards, debit cards, UPI, net banking, and wallets."
  },
  {
    category: "Payments",
    question: "Is my payment information secure?",
    answer: "Yes, we use secure payment gateways and encryption to ensure your payment information is safe and confidential."
  },
  {
    category: "Care Instructions",
    question: "How do I care for my Nuvante T-shirt?",
    answer: [
      "1. Avoid excessive washing and turn the T-shirt inside out before washing to maintain fabric and print quality.",
      "2. Do not use bleach or harsh detergents.",
      "3. Use a protective layer or turn the T-shirt inside out before ironing over the design."
    ]
  },
  {
    category: "Care Instructions",
    question: "What happens if I don't follow the care instructions?",
    answer: "Not following the care instructions may void eligibility for returns or refunds in case of product damage."
  },
  {
    category: "General",
    question: "How do I contact customer support?",
    answer: [
      "You can reach us via:",
      "• Email: nuvanteindia@gmail.com",
      "• Phone: +91 9899044148"
    ]
  }
];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState<string>("Orders");
  const [openQuestions, setOpenQuestions] = useState<Set<string>>(new Set());

  const categories = Array.from(new Set(faqData.map(item => item.category)));

  const toggleQuestion = (question: string) => {
    const newOpenQuestions = new Set(openQuestions);
    if (newOpenQuestions.has(question)) {
      newOpenQuestions.delete(question);
    } else {
      newOpenQuestions.add(question);
    }
    setOpenQuestions(newOpenQuestions);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-16">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/" className="text-gray-600 hover:text-[#DB4444]">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-[#DB4444]">FAQs</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Frequently Asked Questions</h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Welcome to the Nuvante India FAQ section! We've compiled answers to common questions
              to help make your shopping experience smooth and enjoyable.
            </p>
          </motion.div>

          {/* Category Navigation */}
          <div className="flex flex-wrap gap-4 mb-8 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                  activeCategory === category
                    ? "bg-[#DB4444] text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* FAQ Content */}
          <div className="space-y-6">
            {faqData
              .filter((item) => item.category === activeCategory)
              .map((item, index) => (
                <motion.div
                  key={item.question}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-sm overflow-hidden"
                >
                  <button
                    onClick={() => toggleQuestion(item.question)}
                    className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors duration-200"
                  >
                    <span className="font-semibold text-gray-900">{item.question}</span>
                    <svg
                      className={`w-5 h-5 text-gray-500 transform transition-transform duration-200 ${
                        openQuestions.has(item.question) ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openQuestions.has(item.question) && (
                    <div className="px-6 py-4 bg-gray-50 border-t">
                      {Array.isArray(item.answer) ? (
                        <ul className="space-y-2 text-gray-600">
                          {item.answer.map((line, i) => (
                            <li key={i}>{line}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-600">{item.answer}</p>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
          </div>

          {/* Contact Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-16 text-center bg-white rounded-lg shadow-sm p-8"
          >
            <h2 className="text-2xl font-bold mb-4 text-[#DB4444]">Still Have Questions?</h2>
            <p className="text-gray-600 mb-6">
              If you have any additional questions, don't hesitate to reach out. We're here to help!
            </p>
            <a
              href="/Contact"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#DB4444] hover:bg-[#c13a3a] transition-colors duration-200"
            >
              Contact Us
            </a>
          </motion.div>
        </div>
      </div>
      <Footer />
    </>
  );
} 