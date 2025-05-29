"use client";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import React from "react";
import Heading from "@/components/Heading";
import Card from "@/components/Card";
import { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";

const logo = "/logo.png";

const Page = () => {
  const [data, setData] = useState<any[]>([]);
  const [loaded, setLoaded] = useState<boolean>(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.post("/api/propagation", {
          every: true,
        }, {
          timeout: 10000
        });
        setData(Array.isArray(response.data) ? response.data : []);
        setLoaded(true);
      } catch (error) {
        console.error("Error fetching products:", error);
        setData([]);
        setLoaded(true);
      }
    };

    fetchProducts();
  }, []);

  if (!loaded) {
    return (
      <div className="min-h-screen bg-gray-50">
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
    <div>
      <Navbar />
      <div className="p-4">
        <div className="mt-6 max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex flex-col gap-6">
            <div className="flex w-full justify-between items-center">
              <Heading message="Products" secondaryMessage="" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {data.map((product: any) => (
                <Card
                  key={product._id}
                  id={product._id}
                  productName={product.productName}
                  productPrice={Number(product.productPrice)}
                  cancelledPrice={product.cancelledProductPrice}
                  thumbnail={product.thumbnail || "https://fastly.picsum.photos/id/1050/536/354.jpg?hmac=fjxUSeQRIROZvo_be9xEf-vMhMutXf2F5yw-WaWyaWA"}
                  status={product.latest ? "new" : "old"}
                  soldOut={product.soldOut || false}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Page;
