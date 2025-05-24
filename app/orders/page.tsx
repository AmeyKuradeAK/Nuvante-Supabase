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
import { Package, Clock, CheckCircle, XCircle, ChevronRight, ChevronDown, MapPin, Phone, Mail } from "lucide-react";

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
  estimatedDeliveryDate: string;
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

const OrderDetailsModal = ({ order, onClose, products }: OrderDetailsModalProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Order Details</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-r from-[#DB4444]/5 to-transparent p-4 rounded-lg">
              <h3 className="font-semibold mb-3 text-gray-800">Order Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded-md shadow-sm">
                  <p className="text-gray-600">Order Number</p>
                  <p className="font-medium text-gray-800">{order.orderId}</p>
                </div>
                <div className="bg-white p-3 rounded-md shadow-sm">
                  <p className="text-gray-600">Date</p>
                  <p className="font-medium text-gray-800">{new Date(order.timestamp).toLocaleDateString()}</p>
                </div>
                <div className="bg-white p-3 rounded-md shadow-sm">
                  <p className="text-gray-600">Status</p>
                  <p className="font-medium text-gray-800">{order.status}</p>
                </div>
                <div className="bg-white p-3 rounded-md shadow-sm">
                  <p className="text-gray-600">Estimated Delivery</p>
                  <p className="font-medium text-[#DB4444]">{new Date(order.estimatedDeliveryDate).toLocaleDateString()}</p>
                </div>
                <div className="bg-white p-3 rounded-md shadow-sm">
                  <p className="text-gray-600">Total Amount</p>
                  <p className="font-medium text-[#DB4444]">Rs. {order.amount}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#DB4444]/5 to-transparent p-4 rounded-lg">
              <h3 className="font-semibold mb-3 text-gray-800">Shipping Address</h3>
              <div className="bg-white p-4 rounded-lg text-sm shadow-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#DB4444] mt-1" />
                  <div>
                    <p className="font-medium text-gray-800">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                    <p className="text-gray-600">{order.shippingAddress.streetAddress}</p>
                    {order.shippingAddress.apartment && <p className="text-gray-600">{order.shippingAddress.apartment}</p>}
                    <p className="text-gray-600">{order.shippingAddress.city}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <Phone className="w-4 h-4 text-[#DB4444]" />
                  <p className="text-gray-600">{order.shippingAddress.phone}</p>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <Mail className="w-4 h-4 text-[#DB4444]" />
                  <p className="text-gray-600">{order.shippingAddress.email}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#DB4444]/5 to-transparent p-4 rounded-lg">
              <h3 className="font-semibold mb-3 text-gray-800">Items</h3>
              <div className="space-y-4">
                {order.itemDetails.map((item, index) => {
                  const product = products.find(p => p._id === item.productId);
                  if (!product) return null;
                  
                  return (
                    <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="w-20 h-20 relative shrink-0">
                          <img
                            src={product.productImages[0]}
                            alt={product.productName}
                            className="w-full h-full object-cover rounded-md"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-800 truncate">{product.productName}</h3>
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">Size:</span>
                              <span className="text-sm font-medium text-gray-800">{item.size || 'Not selected'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">Quantity:</span>
                              <span className="text-sm font-medium text-gray-800">{item.quantity}</span>
                            </div>
                            <p className="text-[#DB4444] font-semibold mt-1">
                              Rs. {product.productPrice * item.quantity}
                            </p>
                          </div>
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
    </div>
  );
};

const OrdersPage = () => {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const { showAlert } = useAlert();
  const user = useUser();
  const router = useRouter();
  const { GlobalOrders } = useContext(GlobalContext) as GlobalContextType;

  const toggleOrder = (orderId: string) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const fetchOrders = useCallback(async () => {
    try {
      const [ordersResponse, productsResponse] = await Promise.all([
        axios.get<ApiResponse>("/api/orders"),
        axios.post<{ data: any[] }>("/api/propagation", { every: true })
      ]);
      
      if (ordersResponse.data.orders) {
        const sortedOrders = ordersResponse.data.orders.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setOrders(sortedOrders);
      }
      
      if (Array.isArray(productsResponse.data)) {
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
    if (!user.isSignedIn) {
      showAlert("Please sign in to access your orders", "warning");
      router.push("/sign-in");
      return;
    }

    fetchOrders();
  }, [user.isSignedIn, showAlert, router, fetchOrders]);

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
      <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>My Orders</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <h1 className="text-2xl font-bold mb-8 text-gray-800">My Orders</h1>
          
          {!isLoaded ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#DB4444]"></div>
            </div>
          ) : orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.orderId} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-lg font-semibold text-gray-800">Order #{order.orderId}</h2>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(order.timestamp).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-[#DB4444] mt-1">
                          Estimated Delivery: {new Date(order.estimatedDeliveryDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                        <button
                          onClick={() => toggleOrder(order.orderId)}
                          className="text-gray-500 hover:text-[#DB4444] transition-colors"
                        >
                          <ChevronDown className={`w-5 h-5 transform transition-transform ${
                            expandedOrders.has(order.orderId) ? 'rotate-180' : ''
                          }`} />
                        </button>
                      </div>
                    </div>

                    <AnimatePresence>
                      {expandedOrders.has(order.orderId) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="space-y-4">
                              {order.itemDetails.map((item, index) => {
                                const product = products.find(p => p._id === item.productId);
                                if (!product) return null;
                                
                                return (
                                  <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                    <div className="w-20 h-20 relative shrink-0">
                                      <img
                                        src={product.productImages[0]}
                                        alt={product.productName}
                                        className="w-full h-full object-cover rounded-md"
                                      />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h3 className="font-medium text-gray-800 truncate">{product.productName}</h3>
                                      <div className="mt-2 space-y-1">
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm text-gray-600">Size:</span>
                                          <span className="text-sm font-medium text-gray-800">{item.size || 'Not selected'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm text-gray-600">Quantity:</span>
                                          <span className="text-sm font-medium text-gray-800">{item.quantity}</span>
                                        </div>
                                        <p className="text-[#DB4444] font-semibold mt-1">
                                          Rs. {product.productPrice * item.quantity}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                              <div>
                                <p className="text-sm text-gray-600">Total Amount: <span className="font-semibold text-[#DB4444]">Rs. {order.amount}</span></p>
                              </div>
                              <button
                                onClick={() => setSelectedOrder(order)}
                                className="text-[#DB4444] hover:text-black transition-colors flex items-center gap-2 bg-[#DB4444]/5 px-4 py-2 rounded-md"
                              >
                                View Full Details
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <div className="w-20 h-20 mx-auto mb-4 text-gray-400">
                <Package className="w-full h-full" />
              </div>
              <p className="text-gray-500 text-lg">No orders found</p>
              <button
                onClick={() => router.push('/')}
                className="mt-4 text-[#DB4444] hover:text-black transition-colors"
              >
                Continue Shopping
              </button>
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