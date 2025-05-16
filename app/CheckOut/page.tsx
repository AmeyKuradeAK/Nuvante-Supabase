import React from "react";
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

const prodicon = "/product-icon.svg";

const page = () => {
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
        <div className="mt-16 ml-4 xl:ml-32">
          <div>
            <h1 className="text-[36px] font-medium">Billing Details</h1>
          </div>
          <div className="flex flex-col xl:flex-row xl:justify-between items-center mt-10">
            <div className="w-full xl:w-[470px] flex flex-col justify-between">
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
              <div>
                <p>
                  <input
                    className="accent-[#DB4444]"
                    type="checkbox"
                    required
                  />{" "}
                  Save this information for faster check-out next time
                </p>
              </div>
            </div>
            <div className="w-full xl:w-[527px] mt-10 xl:mt-0">
              <div className="flex flex-col justify-between w-full xl:w-[447px] h-[140px]">
                <div className="flex flex-row items-center justify-between">
                  <div className="flex flex-row justify-between items-center">
                    <Image
                      src={prodicon}
                      alt="prodicon"
                      className="w-[41px] h-[34px]"
                      height={25}
                      width={30}
                    />
                    <h1 className="text-sm font-normal pl-2">Kaze GA Fuku</h1>
                  </div>
                  <h1>Rs. 999</h1>
                </div>
                <div className="flex flex-row items-center justify-between">
                  <div className="flex flex-row justify-between items-center">
                    <Image
                      src={prodicon}
                      alt="prodicon"
                      className="w-[41px] h-[34px]"
                      height={25}
                      width={30}
                    />
                    <h1 className="text-sm font-normal pl-2">Kaze GA Fuku</h1>
                  </div>
                  <h1>Rs. 999</h1>
                </div>
              </div>
              <div className="w-full xl:w-[454px] h-[136px] flex flex-col justify-between mt-10">
                <div className="flex flex-row justify-between">
                  <h1>Subtotal:</h1>
                  <h1>Rs. 2997</h1>
                </div>
                <div className="flex flex-row justify-between border-t border-black">
                  <h1>Shipping:</h1>
                  <h1>Free</h1>
                </div>
                <div className="flex flex-row justify-between border-t border-black">
                  <h1>Total:</h1>
                  <h1>Rs. 2997</h1>
                </div>
              </div>
              <div className="mt-10">
                <span>
                  <input type="radio" /> UPI
                </span>
              </div>
              <div className="w-full xl:w-[527px] h-[56px] flex flex-row justify-between mt-10">
                <input
                  className="bg-transparent border rounded-sm h-[56px] w-full xl:w-[300px] border-black"
                  type="text"
                  placeholder="Coupon Code"
                />
                <button className="w-full xl:w-[211px] h-[56px] rounded-sm bg-[#DB4444]">
                  Apply Coupon
                </button>
              </div>
              <div className="rounded-sm mt-10">
                <button className="w-full xl:w-[190px] h-[56px] rounded-sm bg-[#DB4444]">
                  Place Order
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default page;
