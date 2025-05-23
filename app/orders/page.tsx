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
import axios from "axios";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useAlert } from "@/context/AlertContext";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { GlobalContext } from "@/context/Global";
import { Package, Clock, CheckCircle, XCircle, ChevronRight } from "lucide-react";

const logo = "/logo.png";

interface OrderItem {
  orderId: string;
  paymentId: string;
  amount: number;
  currency: string;
  status: string;
  timestamp: string;
  items: string[];
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

interface OrderDetailsModalProps {
  order: OrderItem;
  onClose: () => void;
  products: any[];
}

interface GlobalContextType {
  GlobalOrders: OrderItem[];
}

interface ApiResponse {
  orders: OrderItem[];
}

type ApiResponseOr404 = ApiResponse | 404;

const OrderDetailsModal = ({ order, onClose, products }: OrderDetailsModalProps) => {
  // Calculate expected delivery date (5 days from order date)
  const orderDate = new Date(order.timestamp);
  const expectedDeliveryDate = new Date(orderDate);
  expectedDeliveryDate.setDate(orderDate.getDate() + 5);

  // Get order items with their details
  const orderItems = products.filter(product => order.items.includes(product._id));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Order Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Order ID</p>
              <p className="font-medium">{order.orderId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Payment ID</p>
              <p className="font-medium">{order.paymentId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Order Date</p>
              <p className="font-medium">{new Date(order.timestamp).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Expected Delivery</p>
              <p className="font-medium text-green-600">{expectedDeliveryDate.toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="font-medium text-[#DB4444]">{order.status}</p>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <h3 className="font-semibold mb-4">Order Summary</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium mb-2">Items in this order:</p>
              <ul className="list-disc list-inside space-y-1">
                {orderItems.map(item => (
                  <li key={item._id} className="text-gray-700">
                    {item.productName}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Shipping Address */}
          <div>
            <h3 className="font-semibold mb-4">Shipping Address</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
              <p>{order.shippingAddress.streetAddress}</p>
              {order.shippingAddress.apartment && <p>{order.shippingAddress.apartment}</p>}
              <p>{order.shippingAddress.city}</p>
              <p className="mt-2">Phone: {order.shippingAddress.phone}</p>
              <p>Email: {order.shippingAddress.email}</p>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="font-semibold mb-4">Order Items</h3>
            <div className="space-y-4">
              {orderItems.map(product => (
                <div key={product._id} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-20 h-20 relative">
                    <img
                      src={product.productImages[0]}
                      alt={product.productName}
                      className="w-full h-full object-cover rounded-md"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{product.productName}</h4>
                    <p className="text-[#DB4444] font-semibold">Rs. {product.productPrice}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Total */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>Rs. {order.amount}</span>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-[#DB4444] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const OrdersPage = () => {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const { showAlert } = useAlert();
  const user = useUser();
  const router = useRouter();
  const { GlobalOrders } = useContext(GlobalContext) as GlobalContextType;

  const fetchOrders = useCallback(async () => {
    try {
      const response = await axios.get<ApiResponseOr404>("/api/propagation_client");
      const productsResponse = await axios.post<{ data: any[] }>("/api/propagation", { every: true });
      
      if (response.data === 404 || !response.data) {
        console.error("Could not fetch orders data");
        setOrders([]);
      } else {
        const { orders = [] } = response.data;
        // Sort orders by date (latest first)
        const sortedOrders = orders.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setOrders(sortedOrders);
      }
      
      if (productsResponse.data?.data) {
        setProducts(productsResponse.data.data);
      }
      
      setIsLoaded(true);
    } catch (error) {
      console.error("Error fetching data:", error);
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

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'processing':
        return <Clock className="w-5 h-5 text-blue-500" />;
      default:
        return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <div className="mb-8">
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

          {!isLoaded ? (
            <div className="h-[60vh] flex items-center justify-center">
              <motion.div
                className="relative"
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
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h1 className="text-2xl font-bold mb-6">My Orders</h1>
                
                {orders.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-12"
                  >
                    <div className="w-24 h-24 mx-auto mb-6 text-gray-400">
                      <Package className="w-full h-full" />
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
                  <div className="space-y-4">
                    {orders.map((order, index) => {
                      // Calculate expected delivery date
                      const orderDate = new Date(order.timestamp);
                      const expectedDeliveryDate = new Date(orderDate);
                      expectedDeliveryDate.setDate(orderDate.getDate() + 5);

                      // Get order items with their details
                      const orderItems = products.filter(product => order.items.includes(product._id));

                      return (
                        <motion.div
                          key={order.orderId}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              {getStatusIcon(order.status)}
                              <div>
                                <h3 className="font-medium">Order #{order.orderId.slice(-6)}</h3>
                                <p className="text-sm text-gray-500">
                                  {new Date(order.timestamp).toLocaleDateString()}
                                </p>
                                <p className="text-sm text-green-600">
                                  Expected Delivery: {expectedDeliveryDate.toLocaleDateString()}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                  {orderItems.length} items: {orderItems.map(item => item.productName).join(", ")}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="text-[#DB4444] font-semibold">Rs. {order.amount}</p>
                                <p className="text-sm text-gray-500">{order.items.length} items</p>
                              </div>
                              <ChevronRight className="w-5 h-5 text-gray-400" />
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedOrder && (
          <OrderDetailsModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            products={products}
          />
        )}
      </AnimatePresence>

      <Footer />
    </>
  );
};

export default OrdersPage; 