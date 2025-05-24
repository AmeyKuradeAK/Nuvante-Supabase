"use client";
import { createContext, useState, useEffect, useCallback } from "react";
import React from "react";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface OrderItem {
  orderId: string;
  paymentId: string;
  amount: number;
  currency: string;
  timestamp: string;
  estimatedDeliveryDate: string;
  items: string[];
  trackingId?: string;
  itemStatus?: string;
  itemDetails: {
    productId: string;
    size: string;
    quantity: number;
  }[];
  shippingAddress: {
    firstName: string;
    lastName: string;
    streetAddress: string;
    apartment: string;
    city: string;
    phone: string;
    email: string;
  };
}

interface GlobalContextType {
  GlobalWishlist: string[];
  GlobalCart: string[];
  GlobalOrders: OrderItem[];
  changeGlobalWishlist: (updatedWishlist: string[]) => void;
  changeGlobalCart: (element: string) => void;
  changeGlobalOrders: (order: OrderItem) => void;
  clearGlobalCart: () => void;
  isLoading: boolean;
}

const domain = process.env.NEXT_PUBLIC_DOMAIN;

export const GlobalContext = createContext<GlobalContextType | undefined>(
  undefined
);

interface ApiResponse {
  wishlist: string[];
  cart: string[];
  orders: OrderItem[];
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
  const [GlobalOrders, setGlobalOrders] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const { isSignedIn, user, isLoaded } = useUser();

  // Fetch data from API
  const fetchData = useCallback(async () => {
    if (!isSignedIn || !user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.get<ApiResponse>(`/api/propagation_client`);
      const { wishlist = [], cart = [], orders = [] } = response.data;
      setGlobalWishlist(wishlist);
      setGlobalCart(cart);
      setGlobalOrders(orders);
    } catch (error) {
      console.error("Error fetching data:", error);
      // If unauthorized, redirect to sign in
      if (error && 
          typeof error === 'object' && 
          'response' in error && 
          error.response && 
          typeof error.response === 'object' && 
          'status' in error.response && 
          error.response.status === 401) {
        router.push('/sign-in');
      }
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn, user, router]);

  // Debounced fetch data
  const debouncedFetchData = useCallback(
    debounce(fetchData, 1000),
    [fetchData]
  );

  useEffect(() => {
    if (!isLoaded) return; // Wait for Clerk to load

    if (isSignedIn && user) {
      fetchData();
    } else {
      // Reset state when user is not signed in
      setGlobalWishlist([]);
      setGlobalCart([]);
      setGlobalOrders([]);
      setIsLoading(false);
    }
  }, [isSignedIn, isLoaded, user, fetchData]);

  const changeGlobalWishlist = (updatedWishlist: string[]) => {
    if (!isSignedIn || !user) {
      router.push('/sign-in');
      return;
    }
    setGlobalWishlist(updatedWishlist);
    debouncedFetchData();
  };

  const changeGlobalCart = (element: string) => {
    if (!isSignedIn || !user) {
      router.push('/sign-in');
      return;
    }
    if (GlobalCart.includes(element)) {
      // Remove item from cart
      const updatedCart = GlobalCart.filter(item => item !== element);
      setGlobalCart(updatedCart);
    } else {
      // Add item to cart
      setGlobalCart([...GlobalCart, element]);
    }
    debouncedFetchData();
  };

  const changeGlobalOrders = (order: OrderItem) => {
    if (!isSignedIn || !user) {
      router.push('/sign-in');
      return;
    }
    setGlobalOrders([...GlobalOrders, order]);
    debouncedFetchData();
  };

  const clearGlobalCart = () => {
    if (!isSignedIn || !user) {
      router.push('/sign-in');
      return;
    }
    setGlobalCart([]);
    debouncedFetchData();
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
        isLoading
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};
