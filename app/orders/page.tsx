"use client";
import React, { useState, useCallback, useEffect, useContext } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Sidebar from "@/components/Sidebar";
import axios from "axios";
import Image from "next/image";
import { motion } from "framer-motion";
import { useAlert } from "@/context/AlertContext";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { GlobalContext } from "@/context/Global";

const logo = "/logo.png";

type OrderItem = {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
  orderDate: string;
};

interface ApiResponse {
  orders: OrderItem[];
}

type ApiResponseOr404 = ApiResponse | 404;

const OrdersPage = () => {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { showAlert } = useAlert();
  const user = useUser();
  const router = useRouter();
  const { GlobalOrders }: any = useContext(GlobalContext);

  const fetchOrders = useCallback(async () => {
    try {
      const response = await axios.get<ApiResponseOr404>("/api/propagation_client");
      
      if (response.data === 404 || !response.data) {
        console.error("Could not fetch orders data");
        setOrders([]);
      } else {
        const { orders = [] } = response.data;
        setOrders(orders);
      }
      setIsLoaded(true);
    } catch (error) {
      console.error("Error fetching orders:", error);
      showAlert("Error loading orders. Please try refreshing.", "error");
      setIsLoaded(false);
    }
  }, [showAlert]);

  useEffect(() => {
    if (!user.isSignedIn) {
      showAlert("Please sign in to access your orders", "warning");
      router.push("/sign-in");
      return;
    }

    if (GlobalOrders) {
      fetchOrders();
    }
  }, [user.isSignedIn, GlobalOrders, showAlert, router, fetchOrders]);

  return (
    <>
      <Navbar />
      <div className="p-4">
        <div className="mt-6 ml-4 lg:ml-32">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/" className="text-gray-600 hover:text-[#DB4444]">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-[#DB4444]">My Orders</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {!isLoaded && (
          <motion.div
            className="w-fit mx-auto mt-20 relative"
            animate={{
              rotate: 360,
              transition: {
                duration: 1.5,
                repeat: Infinity,
                ease: "linear"
              },
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                className="w-[80px] h-[80px] rounded-full border-4 border-[#DB4444] border-t-transparent"
                animate={{
                  rotate: -360,
                  transition: {
                    duration: 1,
                    repeat: Infinity,
                    ease: "linear"
                  },
                }}
              />
            </div>
            <Image 
              src={logo} 
              alt="Loading..." 
              width={60} 
              height={60} 
              priority
              className="relative z-10"
              style={{ background: 'transparent' }}
            />
          </motion.div>
        )}

        {isLoaded && (
          <div className="flex flex-col lg:flex-row ml-4 lg:ml-32 mt-8 lg:mt-24">
            <div className="flex flex-col">
              <div className="flex flex-col">
                <h1 className="font-medium">Manage My Account</h1>
                <div className="flex flex-col ml-4 lg:ml-10 pt-4 font-normal">
                  <div className="text-[#DB4444] font-normal cursor-pointer">
                    My Orders
                  </div>
                </div>
              </div>
              <div className="pt-10 font-normal gap-3 flex flex-col">
                <Sidebar />
              </div>
            </div>

            <div className="flex flex-col w-auto lg:w-[870px] pb-10 rounded-sm border lg:ml-32 bg-[#FFFFFF]">
              <div className="mt-8 lg:mt-[40px] ml-4 lg:ml-[80px] h-[28px] w-[155px]">
                <h1 className="font-medium text-[#DB4444]">My Orders</h1>
              </div>

              {!isLoaded ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center py-12"
                >
                  <div className="w-24 h-24 mx-auto mb-6 text-gray-400">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h3>
                  <p className="text-gray-600 mb-6">Your order history will appear here</p>
                  <a
                    href="/Products"
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#DB4444] hover:bg-[#c13a3a] transition-colors duration-200"
                  >
                    Start Shopping
                  </a>
                </motion.div>
              ) : (
                <div className="mt-8 ml-4 lg:ml-[80px] mr-4 lg:mr-[80px]">
                  {GlobalOrders && GlobalOrders.length > 0 ? (
                    GlobalOrders.map((order: any, index: number) => (
                      <motion.div
                        key={order.orderId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="border-b py-6 last:border-b-0"
                      >
                        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
                          <div className="flex-1">
                            <h3 className="font-medium">Order ID: {order.orderId}</h3>
                            <p className="text-gray-600 mt-1">Payment ID: {order.paymentId}</p>
                            <p className="text-[#DB4444] font-medium mt-1">Rs. {order.amount}</p>
                            <p className="text-gray-500 text-sm mt-1">Ordered on: {new Date(order.timestamp).toLocaleDateString()}</p>
                            <p className="text-gray-500 text-sm mt-1">Status: {order.status}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col items-center justify-center py-12"
                    >
                      <div className="w-24 h-24 mx-auto mb-6 text-gray-400">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h3>
                      <p className="text-gray-600 mb-6">Your order history will appear here</p>
                      <a
                        href="/Products"
                        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#DB4444] hover:bg-[#c13a3a] transition-colors duration-200"
                      >
                        Start Shopping
                      </a>
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default OrdersPage; 