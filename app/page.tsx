import Navbar from "@/components/Navbar";
import React from "react";
import MajorLayout from "./major_layout";
import Hero from "@/components/Hero";
import Arrivals from "@/components/Arrivals";
import Products from "@/components/Products";
import Services from "@/components/Services";
import Footer from "@/components/Footer";
import productModel from "@/models/Product";

export default async function Page() {
  const response: any = await productModel
    .find({})
    .then((data) => {
      return data;
    })
    .catch((error) => {
      console.log(error);
      // window.location.href = "/404-page";
      return [];
    });

  return (
    <>
      <Navbar></Navbar>
      <Hero></Hero>
      <MajorLayout>
        <Arrivals fragment={response === null ? [] : response}></Arrivals>
        {/* <Services></Services> */}
      </MajorLayout>
      <Footer></Footer>
    </>
  );
}
