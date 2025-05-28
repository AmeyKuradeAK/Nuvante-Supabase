"use client";
import React, { useState, useEffect } from "react";
import Bread from "./specificComponents/Bread";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Preview from "./specificComponents/Preview";
import Suggestion from "./specificComponents/Suggestion";
import Heading from "@/components/Heading";
import Pre from "./specificComponents/Pre";
import ProductDetailsSkeleton from "@/components/ProductDetailsSkeleton";
import PerformanceMonitor, { usePerformanceMetrics } from "@/components/PerformanceMonitor";

const Page = () => {
  // Performance monitoring
  usePerformanceMetrics("ProductDetailsPage");
  
  const [isLoading, setIsLoading] = useState(true);

  const handleContentLoaded = () => {
    // Small delay to ensure smooth transition
    setTimeout(() => {
      setIsLoading(false);
    }, 200);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <PerformanceMonitor componentName="ProductDetailsLoading" />
        <Navbar />
        <div className="p-4 w-[94%] mx-auto">
          <div className="mt-6 ml-4">
            <ProductDetailsSkeleton />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <PerformanceMonitor componentName="ProductDetailsContent" />
      <Navbar />
      <div className="p-4 w-[94%] mx-auto animate-fade-in-up">
        <div className="mt-6 ml-4 flex flex-col gap-6">
          <Bread />
          <Preview onImagesLoaded={handleContentLoaded} />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Page;
