"use client";
import React from "react";
import { useState, useRef, useEffect } from "react";
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
const animated_logo = "/nuv_1.webm";
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
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
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
    } else {
      setShowDropdown(!showDropdown);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const ProfileDropdown = () => (
    <div 
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
    >
      <div className="py-1" role="menu" aria-orientation="vertical">
        <Link
          href="/Profile"
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#DB4444] transition-colors"
          role="menuitem"
        >
          Account
        </Link>
        <Link
          href="/orders"
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#DB4444] transition-colors"
          role="menuitem"
        >
          Orders
        </Link>
      </div>
    </div>
  );

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
            <div className="flex lg:flex-row items-center gap-4">
              <Link href="/Wishlist" className="hidden lg:flex items-center gap-2">
                <Image
                  src={heart}
                  width={30}
                  height={30}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  alt="heart"
                />
                <span className="text-sm font-medium lg:hidden">Wishlist</span>
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
              <div className="relative">
                <Image
                  src={User}
                  width={30}
                  height={30}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  alt="user"
                  onClick={handleProfileClick}
                />
                {showDropdown && user.isSignedIn && <ProfileDropdown />}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          transition: "all 0.3s ease-in-out",
        }}
        className={`navbar_responsive lg:hidden flex flex-col py-3 overflow-y-hidden ${
          open ? "h-[300px]" : "h-[90px]"
        }`}
      >
        <div className="flex justify-between items-center px-4">
          <div
            onClick={handleNavbar}
            className="hamburger_responsive lg:hidden flex-col gap-1 cursor-pointer flex p-2"
          >
            <div className={`line w-5 h-[2px] bg-black transition-all duration-300 ${open ? 'rotate-45 translate-y-1.5' : ''}`}></div>
            <div className={`line w-5 h-[2px] bg-black transition-all duration-300 ${open ? 'opacity-0' : ''}`}></div>
            <div className={`line w-5 h-[2px] bg-black transition-all duration-300 ${open ? '-rotate-45 -translate-y-1.5' : ''}`}></div>
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
            <div className="relative">
              <Image
                src={User}
                width={30}
                height={30}
                className="cursor-pointer hover:opacity-80 transition-opacity"
                alt="user"
                onClick={handleProfileClick}
              />
              {showDropdown && user.isSignedIn && <ProfileDropdown />}
            </div>
          </div>
        </div>
        <div className="flex-1">
          <ul className="tracking-[2px] flex gap-4 lg:gap-10 ml-3 mt-4 lg:mt-0 lg:ml-0 lg:items-center flex-col text-black lg:flex-row w-fit text-sm">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link href={item.href} className="hover:text-[#DB4444] transition-colors">
                  {item.name}
                </Link>
              </li>
            ))}
            <li className="lg:hidden">
              <Link href="/Wishlist" className="hover:text-[#DB4444] transition-colors">
                Wishlist
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}