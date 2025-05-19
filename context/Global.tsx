"use client";
import { createContext, useState, useEffect } from "react";
import React from "react";
import axios from "axios";
import { useUser } from "@clerk/nextjs";

interface GlobalContextType {
  GlobalWishlist: string[];
  GlobalCart: string[];
  changeGlobalWishlist: (updatedWishlist: string[]) => void;
  changeGlobalCart: (element: any) => void;
}

const domain = process.env.NEXT_PUBLIC_DOMAIN;

export const GlobalContext = createContext<GlobalContextType | undefined>(
  undefined
);

export const GlobalContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [GlobalWishlist, setGlobalWishlist] = useState<string[]>([]);
  const [GlobalCart, setGlobalCart] = useState<string[]>([]);

  const { isSignedIn, user } = useUser();

  const changeGlobalWishlist = (updatedWishlist: string[]) => {
    setGlobalWishlist([...updatedWishlist]);
    (async () => {
      try {
        const response = await axios.get(`/api/propagation_client`);
        if (response.data === 404) {
          alert(
            "Context error 404, error getting the wishlist data to the database."
          );
        } else {
          setGlobalWishlist(response.data.wishlist);
          setGlobalCart(response.data.cart || []);
        }
      } catch (error) {
        console.error("Error updating wishlist:", error);
      }
    })();
  };

  const changeGlobalCart = (element: any) => {
    setGlobalCart([...GlobalCart, element]);
    (async () => {
      try {
        const response = await axios.get(`/api/propagation_client`);
        if (response.data === 404) {
          alert(
            "Context error 404, error getting the cart data to the database."
          );
        } else {
          setGlobalWishlist(response.data.wishlist);
          setGlobalCart(response.data.cart || []);
        }
      } catch (error) {
        console.error("Error updating cart:", error);
      }
    })();
  };

  useEffect(() => {
    if (isSignedIn) {
      // Ensure isSignedIn is true before making API calls
      (async () => {
        try {
          const response = await axios.get(`/api/propagation_client`);
          if (response.data === 404) {
            alert(
              "Context error 404, error getting initial data from the database."
            );
          } else {
            setGlobalWishlist(response.data.wishlist || []);
            setGlobalCart(response.data.cart || []);
          }
        } catch (error) {
          console.error("Error fetching initial data:", error);
        }
      })();
    }
  }, [isSignedIn]); // Add isSignedIn as a dependency

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
