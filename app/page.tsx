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

export default function Page() {
  const [products, setProducts] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.post("/api/propagation", {
          every: true,
        });
        setProducts(Array.isArray(response.data) ? response.data : []);
        setLoaded(true);
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
        setLoaded(true);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      <Hero />
      <MajorLayout>
        {loaded && <Arrivals fragment={products} />}
        {/* <Services /> */}
      </MajorLayout>
      <Footer />
    </div>
  );
}
