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
        <div className="mt-6 ml-4 xl:ml-32">
          <div className="flex flex-col gap-6">
            <div className="flex w-full justify-between items-center">
              <Heading message="Products" secondaryMessage="" />
            </div>
            <div className="flex flex-col gap-12">
              <div className="cards flex flex-wrap sm:w-auto w-[100%] gap-y-10 gap-x-10">
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
