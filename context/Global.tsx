"use client";
import { createContext, useState, useEffect } from "react";
import React from "react";
import axios from "axios";
import { useUser } from "@clerk/nextjs";

interface GlobalContextType {
  GlobalWishlist: string[];
  GlobalCart: string[];
  GlobalOrders: any[];
  changeGlobalWishlist: (updatedWishlist: string[]) => void;
  changeGlobalCart: (element: string) => void;
  changeGlobalOrders: (order: any) => void;
}

const domain = process.env.NEXT_PUBLIC_DOMAIN;

export const GlobalContext = createContext<GlobalContextType | undefined>(
  undefined
);

interface ApiResponse {
  wishlist: string[];
  cart: string[];
  orders: any[];
}

export const GlobalContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [GlobalWishlist, setGlobalWishlist] = useState<string[]>([]);
  const [GlobalCart, setGlobalCart] = useState<string[]>([]);
  const [GlobalOrders, setGlobalOrders] = useState<any[]>([]);

  const { isSignedIn, user } = useUser();

  useEffect(() => {
    if (isSignedIn) {
      (async () => {
        try {
          const response = await axios.get<ApiResponse>(`/api/propagation_client`);
          const { wishlist = [], cart = [], orders = [] } = response.data;
          setGlobalWishlist(wishlist);
          setGlobalCart(cart);
          setGlobalOrders(orders);
        } catch (error) {
          console.error("Error fetching initial data:", error);
          setGlobalWishlist([]);
          setGlobalCart([]);
          setGlobalOrders([]);
        }
      })();
    } else {
      // Reset state when user is not signed in
      setGlobalWishlist([]);
      setGlobalCart([]);
      setGlobalOrders([]);
    }
  }, [isSignedIn]);

  const changeGlobalWishlist = (updatedWishlist: string[]) => {
    setGlobalWishlist(updatedWishlist);
    if (isSignedIn) {
      (async () => {
        try {
          const response = await axios.get<ApiResponse>(`/api/propagation_client`);
          const { wishlist = [], cart = [], orders = [] } = response.data;
          setGlobalWishlist(wishlist);
          setGlobalCart(cart);
          setGlobalOrders(orders);
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
          const { wishlist = [], cart = [], orders = [] } = response.data;
          setGlobalWishlist(wishlist);
          setGlobalCart(cart);
          setGlobalOrders(orders);
        } catch (error) {
          console.error("Error updating cart:", error);
        }
      })();
    }
  };

  const changeGlobalOrders = (order: any) => {
    setGlobalOrders([...GlobalOrders, order]);
    if (isSignedIn) {
      (async () => {
        try {
          const response = await axios.get<ApiResponse>(`/api/propagation_client`);
          const { wishlist = [], cart = [], orders = [] } = response.data;
          setGlobalWishlist(wishlist);
          setGlobalCart(cart);
          setGlobalOrders(orders);
        } catch (error) {
          console.error("Error updating orders:", error);
        }
      })();
    }
  };

  return (
    <GlobalContext.Provider
      value={{
        GlobalWishlist,
        GlobalCart,
        GlobalOrders,
        changeGlobalWishlist,
        changeGlobalCart,
        changeGlobalOrders,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};
