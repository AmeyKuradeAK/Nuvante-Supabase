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
  timestamp: string;
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <h2 className="text-2xl font-bold text-gray-800">Order Details</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-[#DB4444] transition-colors p-2 hover:bg-gray-100 rounded-full"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-r from-[#DB4444]/5 to-transparent p-6 rounded-xl">
              <h3 className="font-semibold mb-4 text-gray-800 text-lg">Order Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-gray-600 text-sm">Order Number</p>
                  <p className="font-medium text-gray-800 mt-1">{order.orderId}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-gray-600 text-sm">Date</p>
                  <p className="font-medium text-gray-800 mt-1">{new Date(order.timestamp).toLocaleDateString()}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-gray-600 text-sm">Order Status</p>
                  <p className="font-medium text-[#DB4444] mt-1">{order.itemStatus || 'Order Accepted'}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-gray-600 text-sm">Estimated Delivery</p>
                  <p className="font-medium text-[#DB4444] mt-1">
                    {order.estimatedDeliveryDate ? 
                      new Date(order.estimatedDeliveryDate).toLocaleDateString() : 
                      new Date(new Date(order.timestamp).getTime() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString()
                    }
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-gray-600 text-sm">Total Amount</p>
                  <p className="font-medium text-[#DB4444] mt-1">Rs. {order.amount}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow sm:col-span-2">
                  <p className="text-gray-600 text-sm">Tracking ID</p>
                  <p className="font-medium text-[#DB4444] mt-1">{order.trackingId || 'Tracking ID will be available soon'}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#DB4444]/5 to-transparent p-6 rounded-xl">
              <h3 className="font-semibold mb-4 text-gray-800 text-lg">Shipping Address</h3>
              <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="bg-[#DB4444]/10 p-3 rounded-full">
                    <MapPin className="w-6 h-6 text-[#DB4444]" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 text-lg">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                    <p className="text-gray-600 mt-1">{order.shippingAddress.streetAddress}</p>
                    {order.shippingAddress.apartment && <p className="text-gray-600">{order.shippingAddress.apartment}</p>}
                    <p className="text-gray-600">{order.shippingAddress.city}</p>
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
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#DB4444]/5 to-transparent p-6 rounded-xl">
              <h3 className="font-semibold mb-4 text-gray-800 text-lg">Items</h3>
              <div className="space-y-4">
                {order.itemDetails.map((item, index) => {
                  const product = products.find(p => p._id === item.productId);
                  if (!product) return null;
                  
                  return (
                    <div key={index} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                        <div className="w-24 h-24 relative shrink-0 group">
                          <img
                            src={product.productImages[0]}
                            alt={product.productName}
                            className="w-full h-full object-cover rounded-lg transition-transform group-hover:scale-105"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-800 text-lg truncate">{product.productName}</h3>
                          <div className="mt-3 space-y-2">
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-gray-600">Size:</span>
                              <span className="text-sm font-medium text-gray-800 bg-gray-100 px-3 py-1 rounded-full">{item.size || 'Not selected'}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-gray-600">Quantity:</span>
                              <span className="text-sm font-medium text-gray-800 bg-gray-100 px-3 py-1 rounded-full">{item.quantity}</span>
                            </div>
                            <p className="text-[#DB4444] font-semibold text-lg mt-2">
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
      // Only fetch products if we have orders
      const ordersResponse = await axios.get<ApiResponse>("/api/orders");
      
      if (ordersResponse.data.orders) {
        const sortedOrders = ordersResponse.data.orders.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setOrders(sortedOrders);

        // Only fetch products if we have orders
        if (sortedOrders.length > 0) {
          const productsResponse = await axios.post<{ data: any[] }>("/api/propagation", { every: true });
          if (Array.isArray(productsResponse.data)) {
            setProducts(productsResponse.data);
          }
        }
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

          <h1 className="text-3xl font-bold mb-8 text-gray-800">My Orders</h1>
          
          {!isLoaded ? (
            <div className="flex justify-center items-center py-12">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-[#DB4444] border-t-transparent rounded-full animate-spin"></div>
                <Image 
                  src={logo} 
                  alt="Loading..." 
                  width={40} 
                  height={40} 
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                />
              </div>
            </div>
          ) : orders.length > 0 ? (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.orderId} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-800">Order #{order.orderId}</h2>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(order.timestamp).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-[#DB4444] mt-1">
                          Estimated Delivery: {order.estimatedDeliveryDate ? 
                            new Date(order.estimatedDeliveryDate).toLocaleDateString() : 
                            new Date(new Date(order.timestamp).getTime() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString()
                          }
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                          order.itemStatus === 'Delivered' ? 'bg-green-100 text-green-800' :
                          order.itemStatus === 'Processing' ? 'bg-blue-100 text-blue-800' :
                          order.itemStatus === 'Dispatched' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.itemStatus || 'Order Accepted'}
                        </span>
                        <button
                          onClick={() => toggleOrder(order.orderId)}
                          className="text-gray-500 hover:text-[#DB4444] transition-colors p-2 hover:bg-gray-100 rounded-full"
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
                          <div className="mt-6 pt-6 border-t border-gray-200">
                            <div className="space-y-4">
                              {order.itemDetails.map((item, index) => {
                                const product = products.find(p => p._id === item.productId);
                                if (!product) return null;
                                
                                return (
                                  <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 bg-gray-50 rounded-xl">
                                    <div className="w-24 h-24 relative shrink-0 group">
                                      <img
                                        src={product.productImages[0]}
                                        alt={product.productName}
                                        className="w-full h-full object-cover rounded-lg transition-transform group-hover:scale-105"
                                      />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h3 className="font-medium text-gray-800 text-lg truncate">{product.productName}</h3>
                                      <div className="mt-3 space-y-2">
                                        <div className="flex items-center gap-3">
                                          <span className="text-sm text-gray-600">Size:</span>
                                          <span className="text-sm font-medium text-gray-800 bg-gray-100 px-3 py-1 rounded-full">{item.size || 'Not selected'}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                          <span className="text-sm text-gray-600">Quantity:</span>
                                          <span className="text-sm font-medium text-gray-800 bg-gray-100 px-3 py-1 rounded-full">{item.quantity}</span>
                                        </div>
                                        <p className="text-[#DB4444] font-semibold text-lg mt-2">
                                          Rs. {product.productPrice * item.quantity}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            <div className="mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                              <div>
                                <p className="text-sm text-gray-600">Total Amount: <span className="font-semibold text-[#DB4444] text-lg">Rs. {order.amount}</span></p>
                              </div>
                              <button
                                onClick={() => setSelectedOrder(order)}
                                className="text-[#DB4444] hover:text-white hover:bg-[#DB4444] transition-all flex items-center gap-2 bg-[#DB4444]/5 px-6 py-3 rounded-lg font-medium"
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
            <div className="text-center py-16 bg-white rounded-xl shadow-sm">
              <div className="w-24 h-24 mx-auto mb-6 text-gray-400">
                <Package className="w-full h-full" />
              </div>
              <p className="text-gray-500 text-xl mb-4">No orders found</p>
              <button
                onClick={() => router.push('/')}
                className="text-[#DB4444] hover:text-white hover:bg-[#DB4444] transition-all px-6 py-3 rounded-lg font-medium bg-[#DB4444]/5"
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