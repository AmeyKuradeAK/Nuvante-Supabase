"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAlert } from "@/context/AlertContext";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { 
  ChevronDown, 
  ChevronUp, 
  HelpCircle, 
  MessageSquare, 
  Clock, 
  CheckCircle,
  Upload,
  X,
  Send,
  Mail,
  Phone,
  MapPin
} from "lucide-react";
import axios from "axios";

interface ApiResponse {
  success: boolean;
  message: string;
  ticketId: string;
}

interface FAQItem {
  id: number;
  question: string;
  answer: string | string[];
  category: string;
}

const faqData: FAQItem[] = [
  {
    id: 1,
    category: "Orders",
    question: "How can I place an order?",
    answer: "You can place an order by browsing our collection, selecting your desired items, choosing your size, and adding them to your cart. Once done, proceed to checkout to complete your purchase. Another way to place an order is through our Instagram Page."
  },
  {
    id: 2,
    category: "Orders",
    question: "Can I cancel or modify my order?",
    answer: "Yes, you can cancel or modify your order within 12 hours of placing it, provided it hasn't been shipped. Please contact our customer support team immediately for assistance."
  },
  {
    id: 3,
    category: "Orders",
    question: "How do I check the status of my order?",
    answer: "You can track your order status by logging into your account and navigating to the \"My Orders\" section or by contacting our Customer Support."
  },
  {
    id: 5,
    category: "Shipping",
    question: "How long does delivery take?",
    answer: "Delivery typically takes 4-7 business days, depending on your location. Remote areas may take longer."
  },
  {
    id: 6,
    category: "Shipping",
    question: "Do you ship internationally?",
    answer: "Currently, we deliver only within India. International shipping will be announced in the future."
  },
  {
    id: 7,
    category: "Returns & Refunds",
    question: "What is your return policy?",
    answer: "Returns are accepted for damaged or defective items within 24 hours of delivery. A valid unboxing video is required for returns."
  },
  {
    id: 8,
    category: "Returns & Refunds",
    question: "How do I initiate a return or refund?",
    answer: "Contact Customer Support with your order details and unboxing video. Once approved, we will guide you through the return process."
  },
  {
    id: 9,
    category: "Returns & Refunds",
    question: "How long will it take to receive my refund?",
    answer: "Refunds are processed within 7-14 business days after the returned item has been inspected and approved."
  },
  {
    id: 10,
    category: "Payments",
    question: "My payment failed but money was deducted. What now?",
    answer: "If your payment failed but money was deducted, don't worry. The amount will be automatically refunded within 5-7 business days. If you don't receive the refund within this timeframe, please create a support ticket with your transaction details."
  },
  {
    id: 11,
    category: "Technical Issues",
    question: "I can't add items to my cart. What should I do?",
    answer: "Make sure you have selected a size before adding items to cart. If you're still facing issues, try clearing your browser cache, disable ad blockers, or try using a different browser. Ensure you're signed in to your account."
  },
  {
    id: 12,
    category: "Technical Issues",
    question: "The website is not loading properly. What should I do?",
    answer: "Try refreshing the page, clearing your browser cache, or switching to a different browser. If the problem persists, please contact our support team."
  },
  {
    id: 13 ,
    category: "General",
    question: "How do I contact customer support?",
    answer: [
      "You can reach us via:",
      "• Email: support@nuvante.in",
      "• Phone: +91 9899044148",
      "• Or visit our Support Center for instant help"
    ]
  }
];

const issueTypes = [
  "Technical Issue",
  "Order Related",
  "Payment Issue",
  "Shipping & Delivery",
  "Product Quality",
  "Return & Refund",
  "Account Issue",
  "Website Bug",
  "Feature Request",
  "Other"
];

const SupportPage = () => {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("Orders");
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showAlert } = useAlert();
  
  const [formData, setFormData] = useState({
    email: "",
    issueType: "",
    subject: "",
    details: "",
    images: [] as File[]
  });

  const categories = Array.from(new Set(faqData.map(item => item.category)));

  const toggleFAQ = (id: number) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + formData.images.length > 5) {
      showAlert("You can upload maximum 5 images", "warning");
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.issueType || !formData.subject || !formData.details) {
      showAlert("Please fill all required fields", "error");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // For now, we'll store images as base64 strings (in production, you'd upload to cloud storage)
      const imagePromises = formData.images.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      });
      
      const imageData = await Promise.all(imagePromises);
      
      const response = await axios.post<ApiResponse>("/api/support", {
        email: formData.email,
        issueType: formData.issueType,
        subject: formData.subject,
        details: formData.details,
        images: imageData
      });

      if (response.data.success) {
        showAlert(`Support ticket created successfully! Ticket ID: ${response.data.ticketId}`, "success");
        setFormData({
          email: "",
          issueType: "",
          subject: "",
          details: "",
          images: []
        });
        setShowTicketForm(false);
      }
    } catch (error: any) {
      console.error("Error creating ticket:", error);
      showAlert(error.response?.data?.error || "Failed to create support ticket", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/" className="text-gray-600 hover:text-[#DB4444] transition-colors duration-300">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-[#DB4444]">Support</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </motion.div>

        {/* Header Section */}
        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-12"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8 mx-auto max-w-4xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#DB4444]/5 to-transparent"></div>
            <div className="relative z-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="w-20 h-20 bg-[#DB4444] rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <HelpCircle className="w-10 h-10 text-white" />
              </motion.div>
              <h1 className="text-4xl font-bold text-gray-800 mb-4">How can we help you?</h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Find answers to common questions or create a support ticket for personalized assistance
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* FAQ Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-xl p-8"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <MessageSquare className="w-6 h-6 text-[#DB4444] mr-3" />
                Frequently Asked Questions
              </h2>

              {/* Category Navigation */}
              <div className="flex flex-wrap gap-2 mb-6">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                      activeCategory === category
                        ? "bg-[#DB4444] text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
              
              <div className="space-y-4">
                {faqData
                  .filter((item) => item.category === activeCategory)
                  .map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 * index }}
                    className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
                  >
                    <button
                      onClick={() => toggleFAQ(item.id)}
                      className="w-full text-left p-6 bg-gray-50 hover:bg-gray-100 transition-colors duration-300 flex justify-between items-center"
                    >
                      <span className="font-semibold text-gray-800 pr-4">{item.question}</span>
                      <motion.div
                        animate={{ rotate: expandedFAQ === item.id ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDown className="w-5 h-5 text-[#DB4444]" />
                      </motion.div>
                    </button>
                    
                    <AnimatePresence>
                      {expandedFAQ === item.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="p-6 bg-white border-t border-gray-200">
                            {Array.isArray(item.answer) ? (
                              <ul className="space-y-2 text-gray-700 leading-relaxed">
                                {item.answer.map((line, i) => (
                                  <li key={i}>{line}</li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-gray-700 leading-relaxed">{item.answer}</p>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>

              {/* Nothing Worked Button */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-8 text-center"
              >
                <div className="bg-gradient-to-r from-[#DB4444]/10 to-transparent p-6 rounded-xl">
                  <p className="text-gray-600 mb-4">Didn't find what you're looking for?</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowTicketForm(true)}
                    className="bg-[#DB4444] text-white px-8 py-3 rounded-lg font-semibold hover:bg-black transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Create Support Ticket
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Contact Info Sidebar */}
          <div className="space-y-6">
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-[#DB4444] mr-3" />
                  <span className="text-gray-600">support@nuvante.in</span>
                </div>
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-[#DB4444] mr-3" />
                  <span className="text-gray-600">+91 9899044148</span>
                </div>
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-[#DB4444] mr-3 mt-1" />
                  <span className="text-gray-600">Support hours: Mon-Fri 9AM-6PM IST</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4">Response Times</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Email Support</span>
                  <span className="text-[#DB4444] font-semibold">24-48 hours</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Critical Issues</span>
                  <span className="text-[#DB4444] font-semibold">2-6 hours</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Support Ticket Modal */}
        <AnimatePresence>
          {showTicketForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              >
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">Create Support Ticket</h2>
                    <button
                      onClick={() => setShowTicketForm(false)}
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DB4444] focus:border-transparent transition-all duration-300"
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Issue Type *
                    </label>
                    <select
                      name="issueType"
                      value={formData.issueType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DB4444] focus:border-transparent transition-all duration-300"
                      required
                    >
                      <option value="">Select an issue type</option>
                      {issueTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DB4444] focus:border-transparent transition-all duration-300"
                      placeholder="Brief description of your issue"
                      maxLength={200}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Issue Details *
                    </label>
                    <textarea
                      name="details"
                      value={formData.details}
                      onChange={handleInputChange}
                      rows={5}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DB4444] focus:border-transparent transition-all duration-300 resize-none"
                      placeholder="Please provide detailed information about your issue..."
                      maxLength={2000}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.details.length}/2000 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Attach Images (Optional)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#DB4444] transition-colors duration-300">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB (Max 5 files)</p>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="mt-2 inline-block bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg cursor-pointer transition-colors duration-300"
                      >
                        Choose Files
                      </label>
                    </div>

                    {formData.images.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {formData.images.map((file, index) => (
                          <div key={index} className="relative">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Upload ${index + 1}`}
                              className="w-full h-20 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowTicketForm(false)}
                      className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-[#DB4444] text-white px-6 py-3 rounded-lg hover:bg-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send className="w-5 h-5 mr-2" />
                          Submit Ticket
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <Footer />
    </div>
  );
};

export default SupportPage; 