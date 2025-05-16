"use client";
import React from "react";
import { useClerk } from "@clerk/nextjs";

export default function Sidebar() {
  const { signOut } = useClerk();

  const signOutFlow = () => {
    // TODO: add a custom sign out flow if possible, maybe a "welcome back" page or smth.
    signOut({
      redirectUrl: "/",
    });
  };

  return (
    <>
      <h1 className="font-medium cursor-pointer">My Wishlist</h1>
      <h1 className="font-medium cursor-pointer">My Cart</h1>
      <h1
        className="font-medium text-[#DB4444] cursor-pointer"
        onClick={signOutFlow}
      >
        Logout
      </h1>
    </>
  );
}
