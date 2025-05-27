"use client";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import React from "react";
import Heading from "@/components/Heading";
import Card from "@/components/Card";
import { useState, useEffect } from "react";
import axios from "axios";

const Page = () => {
  const [data, setData] = useState<any[]>([]);
  const [loaded, setLoaded] = useState<boolean>(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.post("/api/propagation", {
          every: true,
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

  return (
    <div>
      <Navbar />
      <div className="p-4">
        <div className="mt-6 max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex flex-col gap-6">
            <div className="flex w-full justify-between items-center">
              <Heading message="Products" secondaryMessage="" />
            </div>
            <div className="flex flex-col gap-12">
              <div className="cards grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
                {loaded ? (
                  data.length > 0 ? (
                    data.map((product: any, index: number) => (
                      <Card
                        id={product._id}
                        key={index}
                        productName={product.productName}
                        productPrice={product.productPrice}
                        cancelledPrice={product.cancelledProductPrice}
                        src={product.productImages[0]}
                        status={product.latest ? "new" : "old"}
                      />
                    ))
                  ) : (
                    <p>No products were found!</p>
                  )
                ) : (
                  <p>Loading...</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Page;
