"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SizeChartProps {
  isOpen: boolean;
  onClose: () => void;
}

const SizeChart: React.FC<SizeChartProps> = ({ isOpen, onClose }) => {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const sizeData = [
    { 
      size: "S", 
      chest: "41 cm",
      length: "28.5 cm",
      bottom: "41 cm",
      shoulder: "19.5 cm"
    },
    { 
      size: "M", 
      chest: "43 cm",
      length: "29.5 cm",
      bottom: "43 cm",
      shoulder: "20.5 cm"
    },
    { 
      size: "L", 
      chest: "45 cm",
      length: "30.5 cm",
      bottom: "45 cm",
      shoulder: "21.5 cm"
    },
    { 
      size: "XL", 
      chest: "47 cm",
      length: "31 cm",
      bottom: "47 cm",
      shoulder: "22.5 cm"
    },
  ];

  const handleRowClick = (size: string) => {
    setSelectedSize(selectedSize === size ? null : size);
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50, rotateX: -15 }}
            animate={{ scale: 1, opacity: 1, y: 0, rotateX: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -30, rotateX: 10 }}
            transition={{ 
              duration: 0.25, 
              ease: [0.16, 1, 0.3, 1],
              opacity: { duration: 0.2 }
            }}
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-100"
            onClick={(e) => e.stopPropagation()}
            style={{ perspective: "1000px" }}
          >
            {/* Header */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.2, ease: "easeOut" }}
              className="bg-gradient-to-r from-white to-gray-50 border-b border-gray-200 px-6 py-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div 
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.15, duration: 0.3, ease: "easeOut" }}
                    className="w-10 h-10 bg-gradient-to-br from-[#DB4444] to-[#c13a3a] rounded-full flex items-center justify-center shadow-lg"
                  >
                    <motion.svg 
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="w-5 h-5 text-white" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </motion.svg>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.2, ease: "easeOut" }}
                  >
                    <h2 className="text-xl font-bold text-gray-900">NUVANTE</h2>
                    <p className="text-sm text-gray-600">SHIRT (OVERSIZED) MEASUREMENTS</p>
                  </motion.div>
                </div>
                <motion.button
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.25, duration: 0.2, ease: "easeOut" }}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-red-100 transition-colors group"
                >
                  <svg className="w-4 h-4 text-gray-600 group-hover:text-red-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>
            </motion.div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              {/* Size Chart Table */}
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.15, duration: 0.25, ease: "easeOut" }}
                className="overflow-hidden rounded-xl border border-gray-200 shadow-sm bg-white"
              >
                <table className="w-full">
                  <motion.thead 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.2 }}
                    className="bg-gradient-to-r from-[#DB4444] to-[#c13a3a] text-white"
                  >
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold">Size</th>
                      <th className="px-6 py-4 text-left text-sm font-bold">Chest</th>
                      <th className="px-6 py-4 text-left text-sm font-bold">Length</th>
                      <th className="px-6 py-4 text-left text-sm font-bold">Bottom</th>
                      <th className="px-6 py-4 text-left text-sm font-bold">Shoulder</th>
                    </tr>
                  </motion.thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {sizeData.map((item, index) => (
                      <motion.tr
                        key={item.size}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ 
                          delay: 0.25 + index * 0.05, 
                          duration: 0.2, 
                          ease: "easeOut" 
                        }}
                        whileHover={{ 
                          backgroundColor: "rgba(219, 68, 68, 0.05)",
                          scale: 1.01,
                          transition: { duration: 0.1 }
                        }}
                        className={`cursor-pointer transition-all duration-150 ${
                          selectedSize === item.size
                            ? "bg-[#DB4444]/10 border-l-4 border-l-[#DB4444] shadow-sm"
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() => handleRowClick(item.size)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <motion.span 
                              className={`font-bold text-xl ${selectedSize === item.size ? "text-[#DB4444]" : "text-gray-900"}`}
                              whileHover={{ scale: 1.1 }}
                              transition={{ duration: 0.1 }}
                            >
                              {item.size}
                            </motion.span>
                            {selectedSize === item.size && (
                              <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.15, ease: "easeOut" }}
                                className="w-2 h-2 bg-[#DB4444] rounded-full shadow-sm"
                              />
                            )}
                          </div>
                        </td>
                        <motion.td 
                          className="px-6 py-4 text-sm text-gray-700 font-semibold"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.1 }}
                        >
                          {item.chest}
                        </motion.td>
                        <motion.td 
                          className="px-6 py-4 text-sm text-gray-700 font-semibold"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.1 }}
                        >
                          {item.length}
                        </motion.td>
                        <motion.td 
                          className="px-6 py-4 text-sm text-gray-700 font-semibold"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.1 }}
                        >
                          {item.bottom}
                        </motion.td>
                        <motion.td 
                          className="px-6 py-4 text-sm text-gray-700 font-semibold"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.1 }}
                        >
                          {item.shoulder}
                        </motion.td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>

              {/* Product Specific Info */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.25, ease: "easeOut" }}
                className="mt-6 space-y-4"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.35, duration: 0.2, ease: "easeOut" }}
                  className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <motion.svg 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4, duration: 0.2, ease: "easeOut" }}
                      className="w-5 h-5 text-blue-600 mt-0.5" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </motion.svg>
                    <div>
                      <h3 className="font-semibold text-blue-900 mb-1">Oversized Fit Measurements</h3>
                      <p className="text-sm text-blue-800">
                        These measurements are specific to our oversized shirt design. All measurements are in centimeters and represent the actual garment dimensions.
                      </p>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45, duration: 0.2, ease: "easeOut" }}
                  className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border border-yellow-200 shadow-sm"
                >
                  <motion.h4 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.2 }}
                    className="font-semibold text-yellow-900 mb-2 flex items-center gap-2"
                  >
                    <motion.span
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                      💡
                    </motion.span>
                    Measurement Guide
                  </motion.h4>
                  <motion.ul 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.55, duration: 0.2 }}
                    className="text-sm text-yellow-800 space-y-1"
                  >
                    <li>• <strong>Chest:</strong> Measured across the chest from armpit to armpit</li>
                    <li>• <strong>Length:</strong> Measured from shoulder to bottom hem</li>
                    <li>• <strong>Bottom:</strong> Measured across the bottom hem</li>
                    <li>• <strong>Shoulder:</strong> Measured across the back from shoulder to shoulder</li>
                  </motion.ul>
                </motion.div>
              </motion.div>

              {/* Fit Note */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.2, ease: "easeOut" }}
                className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200 shadow-sm"
              >
                <p className="text-sm text-amber-800">
                  <span className="font-semibold">Oversized Fit:</span> This shirt is designed for a relaxed, oversized look. 
                  Model is wearing size L. Choose your regular size for the intended oversized fit.
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