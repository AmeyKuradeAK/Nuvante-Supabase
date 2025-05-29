"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SizeChartProps {
  isOpen: boolean;
  onClose: () => void;
}

const SizeChart: React.FC<SizeChartProps> = ({ isOpen, onClose }) => {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"measurements" | "conversions">("measurements");

  const sizeData = [
    { 
      size: "S", 
      chest: "36-38", 
      waist: "30-32", 
      length: "27", 
      shoulder: "17",
      us: "XS-S",
      uk: "6-8",
      india: "S"
    },
    { 
      size: "M", 
      chest: "38-40", 
      waist: "32-34", 
      length: "28", 
      shoulder: "18",
      us: "S-M",
      uk: "8-10",
      india: "M"
    },
    { 
      size: "L", 
      chest: "40-42", 
      waist: "34-36", 
      length: "29", 
      shoulder: "19",
      us: "M-L",
      uk: "10-12",
      india: "L"
    },
    { 
      size: "XL", 
      chest: "42-44", 
      waist: "36-38", 
      length: "30", 
      shoulder: "20",
      us: "L-XL",
      uk: "12-14",
      india: "XL"
    },
  ];

  const handleRowClick = (size: string) => {
    setSelectedSize(selectedSize === size ? null : size);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 size-chart-backdrop"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#DB4444] rounded-full flex items-center justify-center size-chart-float">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21l9.5-9.5M21 7l-9.5 9.5M7 7h.01M21 21h.01" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Size Chart</h2>
                    <p className="text-sm text-gray-600">International sizing guide</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>

              {/* Tab Navigation */}
              <div className="flex mt-4 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab("measurements")}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                    activeTab === "measurements"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Body Measurements
                </button>
                <button
                  onClick={() => setActiveTab("conversions")}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                    activeTab === "conversions"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  International Sizes
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Size Guide Info */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200"
              >
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-1">
                      {activeTab === "measurements" ? "How to Measure" : "Size Conversion Guide"}
                    </h3>
                    <p className="text-sm text-blue-800">
                      {activeTab === "measurements" 
                        ? "For the best fit, measure yourself with a cloth tape. Click on any size row to highlight it."
                        : "Find your perfect fit with our international size conversion chart for US, UK, and India."
                      }
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Size Chart Table */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="overflow-hidden rounded-lg border border-gray-200"
              >
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Size</th>
                      {activeTab === "measurements" ? (
                        <>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Chest (in)</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Waist (in)</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Length (in)</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Shoulder (in)</th>
                        </>
                      ) : (
                        <>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">US Size</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">UK Size</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">India Size</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sizeData.map((item, index) => (
                      <motion.tr
                        key={item.size}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className={`cursor-pointer transition-all duration-200 size-chart-table-row ${
                          selectedSize === item.size
                            ? "bg-[#DB4444]/10 border-l-4 border-l-[#DB4444]"
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() => handleRowClick(item.size)}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className={`font-semibold ${selectedSize === item.size ? "text-[#DB4444]" : "text-gray-900"}`}>
                              {item.size}
                            </span>
                            {selectedSize === item.size && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-2 h-2 bg-[#DB4444] rounded-full"
                              />
                            )}
                          </div>
                        </td>
                        {activeTab === "measurements" ? (
                          <>
                            <td className="px-4 py-3 text-sm text-gray-700">{item.chest}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">{item.waist}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">{item.length}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">{item.shoulder}</td>
                          </>
                        ) : (
                          <>
                            <td className="px-4 py-3 text-sm text-gray-700 font-medium">{item.us}</td>
                            <td className="px-4 py-3 text-sm text-gray-700 font-medium">{item.uk}</td>
                            <td className="px-4 py-3 text-sm text-gray-700 font-medium">{item.india}</td>
                          </>
                        )}
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>

              {/* Guide Content based on active tab */}
              {activeTab === "measurements" ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Chest Measurement</h4>
                    <p className="text-sm text-gray-600">
                      Measure around the fullest part of your chest, keeping the tape horizontal.
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Waist Measurement</h4>
                    <p className="text-sm text-gray-600">
                      Measure around your natural waistline, where you normally wear your belt.
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Length Measurement</h4>
                    <p className="text-sm text-gray-600">
                      Measure from the highest point of the shoulder down to the desired length.
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Shoulder Measurement</h4>
                    <p className="text-sm text-gray-600">
                      Measure from one shoulder point across the back to the other shoulder point.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mt-6 space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">🇺🇸</span>
                        <h4 className="font-semibold text-blue-900">US Sizes</h4>
                      </div>
                      <p className="text-sm text-blue-800">
                        Standard US clothing sizes. Most common sizing system used globally.
                      </p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">🇬🇧</span>
                        <h4 className="font-semibold text-green-900">UK Sizes</h4>
                      </div>
                      <p className="text-sm text-green-800">
                        British sizing system, typically runs larger than US sizes.
                      </p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">🇮🇳</span>
                        <h4 className="font-semibold text-orange-900">India Sizes</h4>
                      </div>
                      <p className="text-sm text-orange-800">
                        Indian sizing system, similar to international standards.
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <h4 className="font-semibold text-yellow-900 mb-2">💡 Sizing Tips</h4>
                    <ul className="text-sm text-yellow-800 space-y-1">
                      <li>• When in doubt, choose the larger size for a more comfortable fit</li>
                      <li>• Different brands may have slight variations in sizing</li>
                      <li>• Consider the fabric type - cotton may shrink slightly after washing</li>
                      <li>• Check our body measurements tab for the most accurate fit</li>
                    </ul>
                  </div>
                </motion.div>
              )}

              {/* Fit Note */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200"
              >
                <p className="text-sm text-amber-800">
                  <span className="font-semibold">Fit Note:</span> This product has a larger fit than usual. 
                  Model is wearing size L. For a more fitted look, consider sizing down.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SizeChart; 