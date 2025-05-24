"use client";
import Navbar from "@/components/Navbar";
import React from "react";
import MajorLayout from "./major_layout";
import Hero from "@/components/Hero";
import Arrivals from "@/components/Arrivals";
import Products from "@/components/Products";
import Services from "@/components/Services";
import Footer from "@/components/Footer";
import productModel from "@/models/Product";
import { motion } from "framer-motion";

interface Product {
  id: any;
  productName: string;
  productImages: string;
  productPrice: string;
  cancelledProductPrice: string;
  latest: boolean;
}

export default function Page() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productModel.find({});
        // Transform the response to match the expected type
        const transformedProducts = response.map((product: any) => ({
          id: product._id,
          productName: product.productName,
          productImages: product.productImages[0], // Take first image
          productPrice: product.productPrice.toString(),
          cancelledProductPrice: (product.productPrice * 1.2).toString(), // Add 20% markup for cancelled price
          latest: true // Set all products as latest for now
        }));
        setProducts(transformedProducts);
      } catch (error) {
        console.log(error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[#DB4444] border-t-transparent rounded-full animate-spin"></div>
          <img 
            src="/logo.png" 
            alt="Loading..." 
            width={40} 
            height={40} 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse"
          />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100"
    >
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Navbar />
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Hero />
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <MajorLayout>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Arrivals fragment={products} />
          </motion.div>
          {/* <Services /> */}
        </MajorLayout>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Footer />
      </motion.div>
    </motion.div>
  );
}
