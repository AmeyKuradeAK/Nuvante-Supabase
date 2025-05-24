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

export default async function Page() {
  const response: any = await productModel
    .find({})
    .then((data) => {
      return data;
    })
    .catch((error) => {
      console.log(error);
      return [];
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      <Hero />
      <MajorLayout>
        <Arrivals fragment={response === null ? [] : response} />
        {/* <Services /> */}
      </MajorLayout>
      <Footer />
    </div>
  );
}
