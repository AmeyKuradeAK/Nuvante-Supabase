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

// Loading tips to keep users engaged
const loadingTips = [
  "💡 Tip: Use our wishlist to save items for later!",
  "🚚 Free shipping on orders over $50",
  "⭐ Check out our customer reviews for honest feedback",
  "🎯 New arrivals added weekly - don't miss out!",
  "💳 Secure checkout with multiple payment options",
  "📱 Download our app for exclusive deals",
  "🔄 Easy returns within 30 days",
  "🎁 Gift cards available for any occasion"
];

export default function Page() {
  // Performance monitoring
  usePerformanceMetrics("MainPage");
  
  const [products, setProducts] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentTip, setCurrentTip] = useState(0);
  const [loadingStage, setLoadingStage] = useState("Connecting to server...");
  const [heroLoaded, setHeroLoaded] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Simulate loading stages for better UX
        const stages = [
          "Connecting to server...",
          "Loading product catalog...",
          "Fetching latest arrivals...",
          "Preparing your experience...",
          "Almost ready..."
        ];

        let stageIndex = 0;
        const progressInterval = setInterval(() => {
          setLoadingProgress(prev => {
            const newProgress = Math.min(prev + Math.random() * 15 + 5, 95);
            
            // Update stage based on progress
            const newStageIndex = Math.floor((newProgress / 100) * stages.length);
            if (newStageIndex !== stageIndex && newStageIndex < stages.length) {
              stageIndex = newStageIndex;
              setLoadingStage(stages[stageIndex]);
            }
            
            return newProgress;
          });
        }, 300);

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

        clearInterval(progressInterval);
        
        // Complete the progress
        setLoadingProgress(100);
        setLoadingStage("Ready!");
        
        // Small delay to show completion
        setTimeout(() => {
          setProducts(Array.isArray(response.data) ? response.data : []);
          setLoaded(true);
          // Load hero section after a short delay
          setTimeout(() => setHeroLoaded(true), 200);
        }, 500);
        
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

  // Rotate tips every 3 seconds
  useEffect(() => {
    if (!loaded) {
      const tipInterval = setInterval(() => {
        setCurrentTip(prev => (prev + 1) % loadingTips.length);
      }, 3000);
      return () => clearInterval(tipInterval);
    }
  }, [loaded]);

  if (!loaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <PerformanceMonitor componentName="LoadingScreen" />
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh] px-4">
          <div className="max-w-md w-full text-center space-y-8">
            {/* Animated Logo */}
            <div className="relative">
              <div className="w-24 h-24 mx-auto relative">
                {/* Outer spinning ring */}
                <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                <div 
                  className="absolute inset-0 border-4 border-[#DB4444] border-t-transparent rounded-full animate-spin"
                  style={{ animationDuration: '1s' }}
                ></div>
                
                {/* Inner pulsing ring */}
                <div 
                  className="absolute inset-2 border-2 border-[#DB4444] border-opacity-30 rounded-full animate-ping"
                  style={{ animationDuration: '2s' }}
                ></div>
                
                {/* Logo */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Image 
                    src={logo} 
                    alt="Nuvante" 
                    width={48} 
                    height={48} 
                    className="animate-pulse"
                    priority
                  />
                </div>
              </div>
            </div>

            {/* Brand Name */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900 animate-fade-in">
                Nuvante
              </h1>
              <p className="text-gray-600 animate-fade-in-delay">
                Fashion that speaks to you
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-3">
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#DB4444] to-[#ff6b6b] rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${loadingProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 font-medium">
                {loadingStage}
              </p>
              <p className="text-xs text-gray-500">
                {Math.round(loadingProgress)}% complete
              </p>
            </div>

            {/* Loading Tips */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="space-y-3">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-[#DB4444] rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-[#DB4444] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-[#DB4444] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <p 
                  key={currentTip}
                  className="text-sm text-gray-700 animate-fade-in font-medium"
                >
                  {loadingTips[currentTip]}
                </p>
              </div>
            </div>

            {/* Interactive Elements */}
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((item, index) => (
                <div 
                  key={item}
                  className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 cursor-pointer group"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-[#DB4444] to-[#ff6b6b] rounded-full mx-auto mb-2 group-hover:scale-110 transition-transform duration-200"></div>
                  <div className="h-2 bg-gray-100 rounded-full group-hover:bg-gray-200 transition-colors duration-200"></div>
                </div>
              ))}
            </div>

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <p className="text-red-600 text-sm">
                  Taking longer than expected? Don't worry, we're still loading your experience!
                </p>
              </div>
            )}
          </div>
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
