"use client";
import { createContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface OrderItem {
  orderId: string;
  paymentId: string;
  amount: number;
  currency: string;
  status: string;
  timestamp: string;
  estimatedDeliveryDate: string;
  items: string[];
  trackingId: string;
  itemStatus: string;
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
    pin: string;
  };
}

interface GlobalContextType {
  GlobalWishlist: string[];
  GlobalCart: string[];
  GlobalCartQuantities: Record<string, number>;
  GlobalCartSizes: Record<string, string>;
  GlobalOrders: OrderItem[];
  changeGlobalWishlist: (updatedWishlist: string[]) => void;
  changeGlobalCart: (element: string) => Promise<void>;
  changeGlobalCartQuantity: (productId: string, quantity: number) => void;
  changeGlobalCartSize: (productId: string, size: string) => void;
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
  cartQuantities: Record<string, number>;
  cartSizes: Record<string, string>;
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
  children: ReactNode;
}) => {
  const [GlobalWishlist, setGlobalWishlist] = useState<string[]>([]);
  const [GlobalCart, setGlobalCart] = useState<string[]>([]);
  const [GlobalCartQuantities, setGlobalCartQuantities] = useState<Record<string, number>>({});
  const [GlobalCartSizes, setGlobalCartSizes] = useState<Record<string, string>>({});
  const [GlobalOrders, setGlobalOrders] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const { isSignedIn, user, isLoaded } = useUser();

  const fetchData = useCallback(async () => {
    if (!isSignedIn || !user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.get<ApiResponse>(`/api/propagation_client`);
      const { 
        wishlist = [], 
        cart = [], 
        cartQuantities = {}, 
        cartSizes = {}, 
        orders = [] 
      } = response.data;
      setGlobalWishlist(wishlist);
      setGlobalCart(cart);
      setGlobalCartQuantities(cartQuantities);
      setGlobalCartSizes(cartSizes);
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
      setGlobalCartQuantities({});
      setGlobalCartSizes({});
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

  const changeGlobalCart = async (element: string) => {
    if (!isSignedIn || !user) {
      router.push('/sign-in');
      return;
    }
    
    // Don't update local state immediately, let the server be the source of truth
    // Instead, fetch fresh data after the API call
    await fetchData();
  };

  const changeGlobalCartQuantity = (productId: string, quantity: number) => {
    if (!isSignedIn || !user) {
      router.push('/sign-in');
      return;
    }
    setGlobalCartQuantities(prev => ({
      ...prev,
      [productId]: quantity
    }));
    debouncedFetchData();
  };

  const changeGlobalCartSize = (productId: string, size: string) => {
    if (!isSignedIn || !user) {
      router.push('/sign-in');
      return;
    }
    setGlobalCartSizes(prev => ({
      ...prev,
      [productId]: size
    }));
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
    setGlobalCartQuantities({});
    setGlobalCartSizes({});
    debouncedFetchData();
  };

  return (
    <GlobalContext.Provider
      value={{
        GlobalWishlist,
        GlobalCart,
        GlobalCartQuantities,
        GlobalCartSizes,
        GlobalOrders,
        changeGlobalWishlist,
        changeGlobalCart,
        changeGlobalCartQuantity,
        changeGlobalCartSize,
        changeGlobalOrders,
        clearGlobalCart,
        isLoading
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};
