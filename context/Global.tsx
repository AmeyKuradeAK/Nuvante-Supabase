"use client";
import { createContext, useState, useEffect, useCallback } from "react";
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
  clearGlobalCart: () => void;
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

// Debounce function
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const GlobalContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [GlobalWishlist, setGlobalWishlist] = useState<string[]>([]);
  const [GlobalCart, setGlobalCart] = useState<string[]>([]);
  const [GlobalOrders, setGlobalOrders] = useState<any[]>([]);

  const { isSignedIn, user } = useUser();

  // Fetch data from API
  const fetchData = useCallback(async () => {
    try {
      const response = await axios.get<ApiResponse>(`/api/propagation_client`);
      const { wishlist = [], cart = [], orders = [] } = response.data;
      setGlobalWishlist(wishlist);
      setGlobalCart(cart);
      setGlobalOrders(orders);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, []);

  // Debounced fetch data
  const debouncedFetchData = useCallback(
    debounce(fetchData, 1000),
    [fetchData]
  );

  useEffect(() => {
    if (isSignedIn) {
      fetchData();
    } else {
      // Reset state when user is not signed in
      setGlobalWishlist([]);
      setGlobalCart([]);
      setGlobalOrders([]);
    }
  }, [isSignedIn, fetchData]);

  const changeGlobalWishlist = (updatedWishlist: string[]) => {
    setGlobalWishlist(updatedWishlist);
    if (isSignedIn) {
      debouncedFetchData();
    }
  };

  const changeGlobalCart = (element: string) => {
    if (GlobalCart.includes(element)) {
      // Remove item from cart
      const updatedCart = GlobalCart.filter(item => item !== element);
      setGlobalCart(updatedCart);
    } else {
      // Add item to cart
      setGlobalCart([...GlobalCart, element]);
    }
    if (isSignedIn) {
      debouncedFetchData();
    }
  };

  const changeGlobalOrders = (order: any) => {
    setGlobalOrders([...GlobalOrders, order]);
    if (isSignedIn) {
      debouncedFetchData();
    }
  };

  const clearGlobalCart = () => {
    setGlobalCart([]);
    if (isSignedIn) {
      debouncedFetchData();
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
        clearGlobalCart,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};
