"use client";
import React from "react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

const logo_l = "/logo_l.svg";
const logo_r = "/logo_r.svg";
const search = "/search.svg";
const heart = "/heart.svg";
const cart = "/cart.svg";
const caretRight = "./caret-right.svg";
const animated_logo = "/animated.mp4";
const User = "/user.svg";

//* used <Image> instead of <img> and <Link> instead of <a>
//* Otherwise standard implementation of a navbar.

export default function Navbar() {
  const [open, setOpen] = useState<Boolean>(false);
  const user = useUser();
  const [dropdown, setDropdown] = useState<Boolean>(false);

  const selfRedirect = () => {
    //* pass
    window.location.href = "/";
  };

  const handleNavbar = () => {
    //* pretty similar to !false or !true, apparently xors the current navbar state by 1.
    setOpen((prevOpen) => !prevOpen);
  };

  return (
    <>
      <div
        style={{
          transition: "1s all ease",
        }}
        className={`navbar_wrapper navbar_main pb-1 w-full ${
          open ? "h-[420px]" : "h-[100px]"
        } lg:overflow-visible lg:flex overflow-y-hidden hidden`}
      >
        <div className="flex font-bold uppercase lg:justify-between justify-start lg:flex-row flex-col lg:items-center mt-4 navbar w-[90%] mx-auto">
          <div
            className="navbar-brand flex items-center cursor-pointer w-fit"
            onClick={() => {
              window.location.href = "/";
            }}
          >
            <video
              className="top-0 p-1 w-[70px] md:h-fit md:w-[80px]"
              autoPlay
              loop
              playsInline
              muted
              onClick={() => {
                window.location.href = "/";
              }}
            >
              <source src={animated_logo} type="video/mp4"></source>
            </video>
          </div>
          <div>
            <ul className="tracking-[2px] flex gap-6 lg:gap-10 ml-3 mt-4 lg:mt-0 lg:ml-0 lg:items-center flex-col text-black lg:flex-row w-fit">
              <li>
                <a href="/" className="">
                  Home
                </a>
              </li>
              <li>
                <Link href="/Contact">Contact</Link>
              </li>
              <li>
                <Link href="/about">About</Link>
              </li>
              <li>
                <div
                  className="relative flex flex-col"
                  onMouseEnter={() => {
                    setDropdown(true);
                  }}
                  onMouseLeave={() => {
                    setDropdown(false);
                  }}
                >
                  <Link href="/Products">Products</Link>
                  <div
                    className={`bg-[#F5F5F5] absolute top-6 w-[200px] p-2  z-10 px-2 border ${
                      dropdown ? "none" : "hidden"
                    }`}
                  >
                    <div className="flex gap-4 text-black cursor-pointer w-fit border-[#F5F5F5]">
                      <a href="#" className="border-b-[#F5F5F5] border-b-[2px]">
                        Nuvante Originals
                      </a>
                    </div>
                    <div className="flex gap-4 text-black cursor-pointer w-fit mt-4">
                      <a
                        href="/Products/T-shirt"
                        className="border-b-[#F5F5F5] border-b-[2px]"
                      >
                        {" "}
                        T Shirts
                      </a>
                    </div>
                    <div className="flex gap-4 text-black cursor-pointer w-fit mt-4">
                      <a
                        href="/Products/Hoodie"
                        className="border-b-[#F5F5F5] border-b-[2px]"
                      >
                        {" "}
                        Hoodies
                      </a>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
          <div className="gap-4 lg:flex lg:flex-row flex flex-col lg:mt-0 mt-6">
            <div className="flex rounded-lg items-center bg-[#F5F5F5] px-4 w-fit ">
              <input
                type="text"
                className="bg-[#F5F5F5] h-[45px] outline-none w-[220px] rounded-lg text-black"
                placeholder="What are you looking for?"
              ></input>
              <div className="">
                <Image
                  src={search}
                  width={30}
                  className="cursor-pointer"
                  height={30}
                  alt="search"
                ></Image>
              </div>
            </div>
            <div className="flex lg:flex-row items-center gap-4">
              <Link href="/Wishlist">
                <Image
                  src={heart}
                  width={30}
                  height={30}
                  className="cursor-pointer"
                  alt="heart"
                ></Image>
              </Link>
              <Link href="/Cart">
                <Image
                  src={cart}
                  width={30}
                  height={30}
                  className="cursor-pointer"
                  alt="cart"
                ></Image>
              </Link>
              <Link
                href={`${
                  user.isLoaded && user.isSignedIn ? "/Profile" : "/sign-in"
                }`}
              >
                <Image
                  src={User}
                  width={30}
                  height={30}
                  className="cursor-pointer"
                  alt="user"
                ></Image>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          transition: "1s all ease",
        }}
        className={`navbar_responsive lg:hidden flex flex-col py-3 overflow-y-hidden ${
          open ? "h-[350px]" : "h-[90px]"
        }`}
      >
        <div className="flex justify-between items-center px-4">
          <div
            onClick={handleNavbar}
            className="hamburger_responsive lg:hidden flex-col gap-2 cursor-pointer flex"
          >
            <div className="line"></div>
            <div className="line"></div>
            <div className="line"></div>
          </div>
          <div
            className="navbar-brand flex items-center cursor-pointer w-fit"
            onClick={() => {
              window.location.href = "/";
            }}
          >
            <video
              className="top-0 p-1 w-[70px] md:h-fit md:w-[80px]"
              autoPlay
              loop
              playsInline
              muted
              onClick={() => {
                window.location.href = "/";
              }}
            >
              <source src={animated_logo} type="video/mp4"></source>
            </video>
          </div>
          <div className="flex lg:flex-row items-center gap-4">
            <Link href="/Cart">
              <Image
                src={cart}
                width={30}
                height={30}
                className="cursor-pointer"
                alt="cart"
              ></Image>
            </Link>
            <Link
              href={`${
                user.isLoaded && user.isSignedIn ? "/Profile" : "/sign-in"
              }`}
            >
              <Image
                src={User}
                width={30}
                height={30}
                className="cursor-pointer"
                alt="user"
              ></Image>
            </Link>
          </div>
        </div>
        <div>
          <ul className="tracking-[2px] flex gap-6 lg:gap-10 ml-3 mt-4 lg:mt-0 lg:ml-0 lg:items-center flex-col font-semibold text-black lg:flex-row w-fit">
            <li>
              <a href="/" className="">
                Home
              </a>
            </li>
            <li>
              <Link href="/Contact">Contact</Link>
            </li>
            <li>
              <Link href="/about">About</Link>
            </li>
            <li>
              <div
                className="relative flex flex-col"
                onMouseEnter={() => {
                  setDropdown(true);
                }}
                onMouseLeave={() => {
                  setDropdown(false);
                }}
              >
                <Link href="/Products">Products</Link>
                <div
                  className={`bg-[#F5F5F5] absolute top-6 w-[200px] p-2  z-10 px-2 border ${
                    dropdown ? "none" : "hidden"
                  }`}
                >
                  <div className="flex gap-4 text-black cursor-pointer w-fit border-[#F5F5F5]">
                    <a href="#" className="border-b-[#F5F5F5] border-b-[2px]">
                      Nuvante Originals
                    </a>
                  </div>
                  <div className="flex gap-4 text-black cursor-pointer w-fit mt-4">
                    <a
                      href="/Products/T-shirt"
                      className="border-b-[#F5F5F5] border-b-[2px]"
                    >
                      {" "}
                      T Shirts
                    </a>
                  </div>
                  <div className="flex gap-4 text-black cursor-pointer w-fit mt-4">
                    <a
                      href="/Products/Hoodie"
                      className="border-b-[#F5F5F5] border-b-[2px]"
                    >
                      {" "}
                      Hoodies
                    </a>
                  </div>
                </div>
              </div>
            </li>
          </ul>
          <div className="gap-4 lg:flex lg:flex-row flex flex-col lg:mt-0 mt-6">
            <div className="flex rounded-lg items-center bg-[#F5F5F5] px-4 w-fit ">
              <input
                type="text"
                className="bg-[#F5F5F5] h-[45px] outline-none w-[220px] rounded-lg text-black"
                placeholder="What are you looking for?"
              ></input>
              <div className="">
                <Image
                  src={search}
                  width={30}
                  className="cursor-pointer"
                  height={30}
                  alt="search"
                ></Image>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
