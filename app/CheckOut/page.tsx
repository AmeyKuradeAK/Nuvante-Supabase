"use client";

import React, { useContext } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import { GlobalContext } from "@/context/Global";
import { useAlert } from "@/context/AlertContext";
import PaymentButton from "@/components/PaymentButton";
import { useRouter } from "next/navigation";

const prodicon = "/product-icon.svg";

const CheckoutPage = () => {
  const router = useRouter();
  const { showAlert } = useAlert();
  const globalContext = useContext(GlobalContext);

  if (!globalContext) {
    throw new Error("CheckoutPage must be used within GlobalContextProvider");
  }

  const { GlobalCart } = globalContext;

  const calculateTotal = () => {
    // This is a placeholder. You should calculate the actual total based on your cart items
    return 2997; // Replace with actual calculation
  };

  return (
    <>
      <Header />
      <Navbar />
      <div className="p-4">
        <div className="mt-6 ml-4 xl:ml-32">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Products</BreadcrumbPage>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/Cart">
                  <BreadcrumbPage>Cart</BreadcrumbPage>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>CheckOut</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        
        <div className="flex flex-col xl:flex-row xl:justify-between items-center mt-10">
          <div className="w-full xl:w-[470px] flex flex-col justify-between">
            <div>
              <h1 className="text-[36px] font-medium">Billing Details</h1>
            </div>
            <div>
              <h1>
                First Name <span className="text-[#DB4444]">*</span>
              </h1>
              <input
                className="w-full xl:w-[470px] h-[50px] font-normal bg-[#F5F5F5]"
                type="text"
                required
              />
            </div>
            <div>
              <h1>
                Last Name <span className="text-[#DB4444]">*</span>
              </h1>
              <input
                className="w-full xl:w-[470px] h-[50px] font-normal bg-[#F5F5F5]"
                type="text"
                required
              />
            </div>
            <div>
              <h1>
                Street Address <span className="text-[#DB4444]">*</span>
              </h1>
              <input
                className="w-full xl:w-[470px] h-[50px] font-normal bg-[#F5F5F5]"
                type="text"
                required
              />
            </div>
            <div>
              <h1>Apartment, Floor, etc.</h1>
              <input
                className="w-full xl:w-[470px] h-[50px] font-normal bg-[#F5F5F5]"
                type="text"
              />
            </div>
            <div>
              <h1>
                Town/ City <span className="text-[#DB4444]">*</span>
              </h1>
              <input
                className="w-full xl:w-[470px] h-[50px] font-normal bg-[#F5F5F5]"
                type="text"
                required
              />
            </div>
            <div>
              <h1>
                Phone Number <span className="text-[#DB4444]">*</span>
              </h1>
              <input
                className="w-full xl:w-[470px] h-[50px] font-normal bg-[#F5F5F5]"
                type="text"
                required
              />
            </div>
            <div>
              <h1>
                Email Address <span className="text-[#DB4444]">*</span>
              </h1>
              <input
                className="w-full xl:w-[470px] h-[50px] font-normal bg-[#F5F5F5]"
                type="text"
                required
              />
            </div>
          </div>

          <div className="w-full xl:w-[470px] mt-10 xl:mt-0">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({GlobalCart.length} items)</span>
                  <span>Rs. {calculateTotal()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-[#DB4444]">Free</span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>Rs. {calculateTotal()}</span>
                  </div>
                </div>
                <div className="pt-4">
                  <PaymentButton
                    amount={calculateTotal()}
                    currency="INR"
                    receipt={`order_${Date.now()}`}
                    className="w-full bg-[#DB4444] text-white py-3 px-6 rounded-md hover:bg-[#c13a3a] transition-colors duration-200"
                  >
                    Place Order
                  </PaymentButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CheckoutPage;
