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

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, onClose, products }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Order Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Order Number</p>
              <p className="font-medium">{order.orderId}</p>
            </div>
            <div>
              <p className="text-gray-600">Order Date</p>
              <p className="font-medium">{new Date(order.timestamp).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-gray-600">Status</p>
              <p className="font-medium">{order.status}</p>
            </div>
            <div>
              <p className="text-gray-600">Total Amount</p>
              <p className="font-medium">Rs. {order.amount}</p>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-medium mb-4">Shipping Address</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">
                {order.shippingAddress.firstName} {order.shippingAddress.lastName}
              </p>
              <p className="text-sm text-gray-600">{order.shippingAddress.streetAddress}</p>
              {order.shippingAddress.apartment && (
                <p className="text-sm text-gray-600">{order.shippingAddress.apartment}</p>
              )}
              <p className="text-sm text-gray-600">{order.shippingAddress.city}</p>
              <p className="text-sm text-gray-600">Phone: {order.shippingAddress.phone}</p>
              <p className="text-sm text-gray-600">Email: {order.shippingAddress.email}</p>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-medium mb-4">Order Items</h3>
            <div className="space-y-4">
              {order.itemDetails.map((item, index) => {
                const product = products.find(p => p._id === item.productId);
                if (!product) return null;
                
                return (
                  <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-20 h-20 relative">
                      <img
                        src={product.productImages[0]}
                        alt={product.productName}
                        className="w-full h-full object-contain rounded-lg"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">{product.productName}</h4>
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">Size: {item.size || 'Not selected'}</p>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        <p className="text-[#DB4444] font-semibold mt-1">
                          Rs. {product.productPrice * item.quantity}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
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
      console.log("Fetching orders and products...");
      const [ordersResponse, productsResponse] = await Promise.all([
        axios.get<ApiResponse>("/api/orders"),
        axios.post<{ data: any[] }>("/api/propagation", { every: true })
      ]);
      
      console.log("Orders Response:", ordersResponse.data);
      console.log("Products Response:", productsResponse.data);
      
      if (ordersResponse.data.orders) {
        console.log("Parsed Orders:", ordersResponse.data.orders);
        // Sort orders by date (latest first)
        const sortedOrders = ordersResponse.data.orders.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setOrders(sortedOrders);
      }
      
      // The products response is already an array
      if (Array.isArray(productsResponse.data)) {
        console.log("Setting Products:", productsResponse.data);
        setProducts(productsResponse.data);
      }
      
      setIsLoaded(true);
    } catch (error) {
      console.error("Error fetching data:", error);
      showAlert("Error loading orders. Please try refreshing.", "error");
      setIsLoaded(false);
    }
  }, [showAlert]);

  useEffect(() => {
    console.log("Component mounted, user signed in:", user.isSignedIn);
    if (!user.isSignedIn) {
      showAlert("Please sign in to access your orders", "warning");
      router.push("/sign-in");
      return;
    }

    fetchOrders();
  }, [user.isSignedIn, showAlert, router, fetchOrders]);

  // Debug effect to log state changes
  useEffect(() => {
    console.log("Orders state updated:", orders);
    console.log("Products state updated:", products);
  }, [orders, products]);

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
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold mb-8">My Orders</h1>
          
          {!isLoaded ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#DB4444]"></div>
            </div>
          ) : orders.length > 0 ? (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.orderId} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h2 className="text-lg font-semibold">Order #{order.orderId}</h2>
                      <p className="text-sm text-gray-500">
                        {new Date(order.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="space-y-4">
                    {order.itemDetails.map((item, index) => {
                      const product = products.find(p => p._id === item.productId);
                      if (!product) return null;
                      
                      return (
                        <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                          <div className="w-20 h-20 relative">
                            <img
                              src={product.productImages[0]}
                              alt={product.productName}
                              className="w-full h-full object-cover rounded-md"
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-800">{product.productName}</h3>
                            <div className="mt-2">
                              <p className="text-sm text-gray-600">Size: {item.size || 'Not selected'}</p>
                              <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                              <p className="text-[#DB4444] font-semibold mt-1">
                                Rs. {product.productPrice * item.quantity}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-600">Total Amount: Rs. {order.amount}</p>
                      </div>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-[#DB4444] hover:text-black transition-colors flex items-center gap-2"
                      >
                        View Details
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No orders found</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          products={products}
        />
      )}
    </>
  );
};

export default OrdersPage; 