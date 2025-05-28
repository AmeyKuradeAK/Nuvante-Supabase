"use client";
import Navbar from "@/components/Navbar";
import React, { useState, useEffect } from "react";
import MajorLayout from "./major_layout";
import Hero from "@/components/Hero";
import Arrivals from "@/components/Arrivals";
import Products from "@/components/Products";
import Services from "@/components/Services";
import Footer from "@/components/Footer";
import LazySection from "@/components/LazySection";
import SkeletonLoader from "@/components/SkeletonLoader";
import PerformanceMonitor, { measureApiCall, usePerformanceMetrics } from "@/components/PerformanceMonitor";
import axios from "axios";
import Image from "next/image";

const logo = "/logo.png";

export default function Page() {
  // Performance monitoring
  usePerformanceMetrics("MainPage");
  
  const [products, setProducts] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [heroLoaded, setHeroLoaded] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Use performance monitoring for API call
        const response = await measureApiCall(
          async () => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            
            const result = await axios.post("/api/propagation", {
              every: true,
            }, {
              timeout: 10000
            });
            
            clearTimeout(timeoutId);
            return result;
          },
          "ProductPropagation"
        );
        
        // Small delay to show the loading animation briefly
        setTimeout(() => {
          setProducts(Array.isArray(response.data) ? response.data : []);
          setLoaded(true);
          // Load hero section after a short delay
          setTimeout(() => setHeroLoaded(true), 100);
        }, 300); // Much faster loading time
        
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
        setError(true);
        setLoaded(true);
        setHeroLoaded(true);
      }
    };

    fetchProducts();
  }, []);

  if (!loaded) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <PerformanceMonitor componentName="LoadingScreen" />
        
        {/* Modern Boilerplate Loading Animation */}
        <div className="flex flex-col items-center space-y-4 animate-fade-in-up">
          {/* Logo with subtle animation */}
          <div className="relative animate-scale-in">
            <Image 
              src={logo} 
              alt="Nuvante" 
              width={56} 
              height={56} 
              className="opacity-90"
              priority
            />
            {/* Subtle pulse overlay */}
            <div className="absolute inset-0 bg-[#DB4444] opacity-20 rounded-full animate-ping"></div>
          </div>
          
          {/* Brand name */}
          <h1 className="text-xl font-medium text-gray-900 tracking-wide">
            Nuvante
          </h1>
          
          {/* Modern loading dots */}
          <div className="flex space-x-1">
            <div className="w-1.5 h-1.5 bg-[#DB4444] rounded-full animate-bounce"></div>
            <div className="w-1.5 h-1.5 bg-[#DB4444] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-1.5 h-1.5 bg-[#DB4444] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          
          {/* Simple loading text */}
          <p className="text-sm text-gray-500 animate-pulse">
            Loading your experience...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <PerformanceMonitor componentName="MainPageContent" />
      <Navbar />
      
      {/* Hero Section with Skeleton Loading */}
      {heroLoaded ? (
        <div className="animate-fade-in">
          <Hero />
        </div>
      ) : (
        <div className="container-ecommerce py-8">
          <SkeletonLoader type="hero" className="w-full" />
        </div>
      )}
      
      <MajorLayout>
        {/* Lazy Load Arrivals Section */}
        <LazySection 
          skeletonType="product" 
          skeletonCount={8}
          className="py-8"
        >
          <Arrivals fragment={products} />
        </LazySection>
        
        {/* Lazy Load Services Section */}
        {/* <LazySection 
          skeletonType="text" 
          skeletonCount={3}
          className="py-8"
        >
          <Services />
        </LazySection> */}
      </MajorLayout>
      
      <Footer />
    </div>
  );
}
