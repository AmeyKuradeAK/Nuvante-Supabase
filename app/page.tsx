"use client";
import Navbar from "@/components/Navbar";
import React, { useState, useEffect } from "react";
import MajorLayout from "./major_layout";
import Hero from "@/components/Hero";
import Arrivals from "@/components/Arrivals";
import Products from "@/components/Products";
import Services from "@/components/Services";
import Footer from "@/components/Footer";
import axios from "axios";
import Image from "next/image";

const logo = "/logo.png";

export default function Page() {
  const [products, setProducts] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Add timeout to prevent hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await axios.post("/api/propagation", {
          every: true,
        }, {
          timeout: 10000
        });

        clearTimeout(timeoutId);
        setProducts(Array.isArray(response.data) ? response.data : []);
        setLoaded(true);
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
        setError(true);
        setLoaded(true);
      }
    };

    fetchProducts();
  }, []);

  if (!loaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-[#DB4444] border-t-transparent rounded-full animate-spin"></div>
            <Image 
              src={logo} 
              alt="Loading..." 
              width={40} 
              height={40} 
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      <Hero />
      <MajorLayout>
        <Arrivals fragment={products} />
        {/* <Services /> */}
      </MajorLayout>
      <Footer />
    </div>
  );
}
