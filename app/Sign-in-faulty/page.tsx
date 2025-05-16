import React from "react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import Link from "next/link";

const sideImg = "/Side-Image.png";
const googleLogo = "/Icon-Google.png";

const page = () => {
  return (
    <div>
      <Navbar />
      <div className="flex flex-col xl:flex-row xl:h-[781px] xl:w-[1305px] xl:items-center xl:justify-between xl:mt-12 items-center">
        <div>
          <Image src={sideImg} alt="side-image" height={781} width={805} />
        </div>
        <div className="h-auto w-full max-w-[371px] flex flex-col justify-between items-center">
          <div className="text-left xl:text-left">
            <h1 className="text-[36px] xl:text-[36px] font-medium">
              Log In to Nuvante
            </h1>
            <p className="font-normal text-left text-sm pt-5">
              Enter your details here
            </p>
          </div>
          <div className="w-full xl:w-[370px] flex flex-col xl:justify-between items-center mt-5">
            <input
              className="h-[32px] w-full bg-transparent border-b border-black mt-3"
              type="text"
              placeholder="Email or Phone number"
            />
            <input
              className="h-[32px] w-full bg-transparent border-b border-black mt-3"
              type="text"
              placeholder="Password"
            />
          </div>
          <div className="flex flex-col xl:flex-row items-center justify-between w-full max-w-[370px] mt-5">
            <button className="h-[56px] w-[143px] bg-[#DB4444] text-white">
              Log In
            </button>
            <button className="text-[#DB4444]">Forgot Password?</button>
          </div>
          <p className="text-center mt-3">
            Not yet registered?{" "}
            <Link className="border-b border-black" href="/Sign-up">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default page;
