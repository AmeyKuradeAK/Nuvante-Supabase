"use client";
import React from "react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useUser, useClerk } from "@clerk/nextjs";
import { useAlert } from "@/context/AlertContext";
import { useRouter } from "next/navigation";
import { ShoppingCart, Heart, User as UserIcon, Package, LogOut } from "lucide-react";

const logo_l = "/logo_l.svg";
const logo_r = "/logo_r.svg";
const search = "/search.svg";
const heart = "/heart.svg";
const cart = "/cart.svg";
const animated_logo = "/nuv_1.webm";
const User = "/user.svg";
const Orders = "/orders.svg";

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
  const { signOut } = useClerk();

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

  const handleCartClick = (e: React.MouseEvent) => {
    if (!user.isSignedIn) {
      e.preventDefault();
      showAlert("Please sign in to access your cart", "warning");
      setTimeout(() => {
        router.push("/sign-in");
      }, 2000);
    }
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    if (!user.isSignedIn) {
      e.preventDefault();
      showAlert("Please sign in to access your wishlist", "warning");
      setTimeout(() => {
        router.push("/sign-in");
      }, 2000);
    }
  };

  const handleOrdersClick = (e: React.MouseEvent) => {
    if (!user.isSignedIn) {
      e.preventDefault();
      showAlert("Please sign in to access your orders", "warning");
      setTimeout(() => {
        router.push("/sign-in");
      }, 2000);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      showAlert("Logged out successfully", "success");
      router.push("/");
    } catch (error) {
      showAlert("Error logging out", "error");
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
        } lg:overflow-visible lg:flex overflow-y-hidden hidden relative`}
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
          
          <div className="flex lg:flex-row items-center gap-4">
            <Link href="/Wishlist" className="hidden lg:flex items-center gap-2" onClick={handleWishlistClick}>
              <Heart className="h-6 w-6" />
              <span className="text-sm font-medium lg:hidden">Wishlist</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/Cart" onClick={handleCartClick}>
                <ShoppingCart className="h-6 w-6" />
              </Link>
              <Link href="/orders" className="hidden lg:flex" onClick={handleOrdersClick}>
                <Package className="h-6 w-6" />
              </Link>
              <Link href="/Profile" onClick={handleProfileClick}>
                <UserIcon className="h-6 w-6" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          transition: "all 0.3s ease-in-out",
        }}
        className={`navbar_responsive lg:hidden flex flex-col py-3 overflow-y-hidden relative ${
          open ? "h-[200px]" : "h-[90px]"
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
          <div className="flex items-center gap-4">
            <Link href="/Cart" className="text-gray-600 hover:text-[#DB4444]" onClick={handleCartClick}>
              <ShoppingCart className="h-6 w-6" />
            </Link>
            <Link href="/Profile" className="text-gray-600 hover:text-[#DB4444]" onClick={handleProfileClick}>
              <UserIcon className="h-6 w-6" />
            </Link>
          </div>
        </div>
        <div className="flex-1 px-4">
          <div className="grid grid-cols-2 gap-4 mt-4 pb-6">
            <div className="space-y-4">
              {navigation.slice(0, 2).map((item) => (
                <Link 
                  key={item.name}
                  href={item.href} 
                  className="block hover:text-[#DB4444] transition-colors"
                >
                  {item.name}
                </Link>
              ))}
              <Link 
                href="/Wishlist" 
                className="block hover:text-[#DB4444] transition-colors"
                onClick={handleWishlistClick}
              >
                Wishlist
              </Link>
            </div>
            <div className="space-y-4">
              {navigation.slice(2).map((item) => (
                <Link 
                  key={item.name}
                  href={item.href} 
                  className="block hover:text-[#DB4444] transition-colors"
                >
                  {item.name}
                </Link>
              ))}
              <Link 
                href="/orders" 
                className="block hover:text-[#DB4444] transition-colors"
                onClick={handleOrdersClick}
              >
                Orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}