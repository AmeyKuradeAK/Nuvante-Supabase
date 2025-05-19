"use client";
import React from "react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useAlert } from "@/context/AlertContext";
import { useRouter } from "next/navigation";

const logo_l = "/logo_l.svg";
const logo_r = "/logo_r.svg";
const search = "/search.svg";
const heart = "/heart.svg";
const cart = "/cart.svg";
const animated_logo = "/animated_light.mp4";
const User = "/user.svg";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Products", href: "/Products" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/Contact" },
];

//* used <Image> instead of <img> and <Link> instead of <a>
//* Otherwise standard implementation of a navbar.

export default function Navbar() {
  const [open, setOpen] = useState<Boolean>(false);
  const user = useUser();
  const { showAlert } = useAlert();
  const router = useRouter();

  const handleNavbar = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    if (!user.isSignedIn) {
      e.preventDefault();
      showAlert("Please sign in to access your profile", "warning");
      setTimeout(() => {
        router.push("/sign-in");
      }, 2000);
    }
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
              className="top-0 p-1 w-[85px] md:h-fit md:w-[95px]"
              autoPlay
              loop
              playsInline
              muted
              preload="auto"
              onClick={() => {
                window.location.href = "/";
              }}
            >
              <source src={animated_logo} type="video/mp4"></source>
            </video>
          </div>
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-600 hover:text-[#DB4444] transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>
          <div className="gap-4 lg:flex lg:flex-row flex flex-col lg:mt-0 mt-6">
            <div className="flex rounded-lg items-center bg-[#F5F5F5] px-4 w-fit hidden">
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
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  alt="heart"
                ></Image>
              </Link>
              <Link href="/Cart">
                <Image
                  src={cart}
                  width={30}
                  height={30}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  alt="cart"
                ></Image>
              </Link>
              <Link
                href={user.isLoaded && user.isSignedIn ? "/Profile" : "/sign-in"}
                onClick={handleProfileClick}
              >
                <Image
                  src={User}
                  width={30}
                  height={30}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
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
            className="hamburger_responsive lg:hidden flex-col gap-1 cursor-pointer flex p-2"
          >
            <div className="line w-5 h-[2px] bg-black"></div>
            <div className="line w-5 h-[2px] bg-black"></div>
            <div className="line w-5 h-[2px] bg-black"></div>
          </div>
          <div
            className="navbar-brand flex items-center cursor-pointer w-fit"
            onClick={() => {
              window.location.href = "/";
            }}
          >
            <video
              className="top-0 p-1 w-[85px] md:h-fit md:w-[95px]"
              autoPlay
              loop
              playsInline
              muted
              preload="auto"
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
                className="cursor-pointer hover:opacity-80 transition-opacity"
                alt="cart"
              ></Image>
            </Link>
            <Link
              href={user.isLoaded && user.isSignedIn ? "/Profile" : "/sign-in"}
              onClick={handleProfileClick}
            >
              <Image
                src={User}
                width={30}
                height={30}
                className="cursor-pointer hover:opacity-80 transition-opacity"
                alt="user"
              ></Image>
            </Link>
          </div>
        </div>
        <div>
          <ul className="tracking-[2px] flex gap-4 lg:gap-10 ml-3 mt-4 lg:mt-0 lg:ml-0 lg:items-center flex-col text-black lg:flex-row w-fit text-sm">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link href={item.href} className="hover:text-[#DB4444] transition-colors">
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}