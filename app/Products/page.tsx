import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import React from "react";
import Heading from "@/components/Heading";
import Card from "@/components/Card";
import productModel from "@/models/Product";

const Page = async () => {
  const response = await productModel
    .find({})
    .then((data) => {
      return data;
    })
    .catch((error) => {
      localStorage.setItem("page.tsx/Products", error);
      window.location.href = "/404-error";
      return [];
    });

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
                {response.map((product: any, index: number) => (
                  <Card
                    id={product.id}
                    key={index}
                    productName={product.productName}
                    productPrice={product.productPrice}
                    cancelledPrice={product.cancelledProductPrice}
                    src={product.productImages[0]}
                    status={product.latest ? "new" : "old"}
                  />
                ))}
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
