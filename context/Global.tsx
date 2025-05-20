"use client";
import { createContext, useState, useEffect } from "react";
import React from "react";
import axios from "axios";
import { useUser } from "@clerk/nextjs";

interface GlobalContextType {
  GlobalWishlist: string[];
  GlobalCart: string[];
  changeGlobalWishlist: (updatedWishlist: string[]) => void;
  changeGlobalCart: (element: string) => void;
}

const domain = process.env.NEXT_PUBLIC_DOMAIN;

export const GlobalContext = createContext<GlobalContextType | undefined>(
  undefined
);

interface ApiResponse {
  wishlist: string[];
  cart: string[];
}

export const GlobalContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [GlobalWishlist, setGlobalWishlist] = useState<string[]>([]);
  const [GlobalCart, setGlobalCart] = useState<string[]>([]);

  const { isSignedIn, user } = useUser();

  useEffect(() => {
    if (isSignedIn) {
      (async () => {
        try {
          const response = await axios.get<ApiResponse>(`/api/propagation_client`);
          const { wishlist = [], cart = [] } = response.data;
          setGlobalWishlist(wishlist);
          setGlobalCart(cart);
        } catch (error) {
          console.error("Error fetching initial data:", error);
          setGlobalWishlist([]);
          setGlobalCart([]);
        }
      })();
    } else {
      // Reset state when user is not signed in
      setGlobalWishlist([]);
      setGlobalCart([]);
    }
  }, [isSignedIn]);

  const changeGlobalWishlist = (updatedWishlist: string[]) => {
    setGlobalWishlist(updatedWishlist);
    if (isSignedIn) {
      (async () => {
        try {
          const response = await axios.get<ApiResponse>(`/api/propagation_client`);
          const { wishlist = [], cart = [] } = response.data;
          setGlobalWishlist(wishlist);
          setGlobalCart(cart);
        } catch (error) {
          console.error("Error updating wishlist:", error);
        }
      })();
    }
  };

  const changeGlobalCart = (element: string) => {
    if (GlobalCart.includes(element)) {
      setGlobalCart(GlobalCart.filter(item => item !== element));
    } else {
      setGlobalCart([...GlobalCart, element]);
    }
    if (isSignedIn) {
      (async () => {
        try {
          const response = await axios.get<ApiResponse>(`/api/propagation_client`);
          const { wishlist = [], cart = [] } = response.data;
          setGlobalWishlist(wishlist);
          setGlobalCart(cart);
        } catch (error) {
          console.error("Error updating cart:", error);
        }
      })();
    }
  };

  return (
    <GlobalContext.Provider
      value={{
        GlobalWishlist,
        GlobalCart,
        changeGlobalWishlist,
        changeGlobalCart,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};
