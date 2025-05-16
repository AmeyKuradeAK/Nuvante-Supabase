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
      <div className="sm:p-4 p-0">
        <div className="mt-6 sm:ml-4 ml-0 xl:ml-32">
          <div className="flex flex-col gap-6">
            <div className="flex w-full justify-between items-center">
              <Heading message="Products" secondaryMessage="" />
            </div>
            <div className="flex flex-col gap-12 w-fit mx-auto">
              <div className="cards flex flex-wrap sm:gap-x-6 gap-x-2 sm:w-auto sm:justify-center justify-center w-[100%] gap-y-16">
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
