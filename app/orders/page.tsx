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

const formatStatus = (status: string | undefined) => {
  if (!status) return 'Order Accepted';
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

interface Product {
  _id: string;
  productName: string;
  thumbnail: string;
  productImages: string[];
  productPrice: string;
  cancelledProductPrice: string;
  latest: boolean;
  description: string;
  materials: string;
  productInfo: string;
  type: string;
  soldOut: boolean;
  soldOutSizes: string[];
  packaging: string;
  shipping: string;
}

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
    pin: string;
  };
  estimatedDeliveryDate: string;
}

interface OrderDetailsModalProps {
  order: OrderItem;
  onClose: () => void;
  products: Product[];
}

interface GlobalContextType {
  GlobalOrders: OrderItem[];
}

interface ApiResponse {
  orders: OrderItem[];
}

const OrderDetailsModal = ({ order, onClose, products }: OrderDetailsModalProps) => {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl scrollbar-hide">
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <h2 className="text-2xl font-bold text-gray-800">Order Details</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-[#DB4444] transition-colors duration-200 p-2 hover:bg-gray-100 rounded-full"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-r from-[#DB4444]/5 to-transparent p-6 rounded-xl">
              <h3 className="font-semibold mb-4 text-gray-800 text-lg">Order Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Order Number", value: order.orderId },
                  { label: "Date", value: new Date(order.timestamp).toLocaleDateString() },
                  { label: "Order Status", value: formatStatus(order.itemStatus), isHighlighted: true },
                  { label: "Estimated Delivery", value: order.estimatedDeliveryDate ? 
                    new Date(order.estimatedDeliveryDate).toLocaleDateString() : 
                    new Date(new Date(order.timestamp).getTime() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString(),
                    isHighlighted: true
                  },
                  { label: "Total Amount", value: `Rs. ${order.amount}`, isHighlighted: true },
                  { label: "Tracking ID", value: order.trackingId || "Tracking ID will be available soon", isHighlighted: true, fullWidth: true }
                ].map((item, index) => (
                  <div
                    key={index}
                    className={`bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 ${item.fullWidth ? 'sm:col-span-2' : ''}`}
                  >
                    <p className="text-gray-600 text-sm">{item.label}</p>
                    <p className={`font-medium mt-1 ${item.isHighlighted ? 'text-[#DB4444]' : 'text-gray-800'}`}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#DB4444]/5 to-transparent p-6 rounded-xl">
              <h3 className="font-semibold mb-4 text-gray-800 text-lg">Shipping Address</h3>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="bg-[#DB4444]/10 p-3 rounded-full">
                    <MapPin className="w-6 h-6 text-[#DB4444]" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 text-lg">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                    <p className="text-gray-600 mt-1">{order.shippingAddress.streetAddress}</p>
                    {order.shippingAddress.apartment && <p className="text-gray-600">{order.shippingAddress.apartment}</p>}
                    <p className="text-gray-600">{order.shippingAddress.city}</p>
                    {order.shippingAddress.pin && <p className="text-gray-600">PIN: {order.shippingAddress.pin}</p>}
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
                  
                  // Safe image URL with fallback chain
                  const imageUrl = (product.productImages && product.productImages[0]) 
                    ? product.productImages[0] 
                    : product.thumbnail || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=536&h=354&fit=crop&crop=center";
                  
                  return (
                    <div
                      key={index}
                      className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                        <div className="w-24 h-24 relative shrink-0">
                          <img
                            src={imageUrl}
                            alt={product.productName}
                            className="w-full h-full object-cover rounded-lg"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=536&h=354&fit=crop&crop=center";
                            }}
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
                              Rs. {(Number(product.productPrice) || 0) * item.quantity}
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
  const [products, setProducts] = useState<Product[]>([]);
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
          const productsResponse = await axios.post<Product[]>("/api/propagation", { every: true });
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/" className="text-gray-600 hover:text-[#DB4444] transition-colors duration-300 ease-in-out">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-[#DB4444]">Orders</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {!isLoaded && (
          <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-[#DB4444] border-t-transparent rounded-full animate-spin"></div>
              <Image 
                src={logo} 
                alt="Loading..." 
                width={40} 
                height={40} 
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse"
              />
            </div>
          </div>
        )}

        {isLoaded && (
          <div className="space-y-8">
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 ease-in-out p-6"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">My Orders</h1>
                  <p className="text-gray-600 mt-1">
                    {orders.length} {orders.length === 1 ? 'order' : 'orders'} placed
                  </p>
                </div>
              </div>
            </motion.div>

            {orders.length === 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 ease-in-out p-12 text-center"
              >
                <div className="w-24 h-24 mx-auto mb-6 text-gray-400 animate-bounce">
                  <Package className="w-full h-full" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No orders yet</h3>
                <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
                <a
                  href="/Products"
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-[#DB4444] hover:bg-[#c13a3a] transition-all duration-300 ease-in-out shadow-sm hover:shadow-md transform hover:scale-105"
                >
                  Start Shopping
                </a>
              </motion.div>
            )}

            {orders.length > 0 && (
              <div className="space-y-4">
                {orders.map((order, index) => (
                  <motion.div
                    key={order.orderId}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 ease-in-out overflow-hidden"
                  >
                    <div 
                      className="p-6 cursor-pointer"
                      onClick={() => toggleOrder(order.orderId)}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="bg-[#DB4444]/10 p-3 rounded-full transform hover:scale-110 transition-transform duration-300">
                            <Package className="w-6 h-6 text-[#DB4444]" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-800">Order #{order.orderId.slice(-6)}</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Placed on {new Date(order.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-medium text-[#DB4444]">Rs. {order.amount}</p>
                            <p className="text-sm text-gray-600 mt-1">{formatStatus(order.itemStatus)}</p>
                          </div>
                          <motion.button
                            animate={{ rotate: expandedOrders.has(order.orderId) ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                            className="text-gray-400 hover:text-[#DB4444] transition-colors duration-300"
                          >
                            <ChevronDown className="w-6 h-6" />
                          </motion.button>
                        </div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {expandedOrders.has(order.orderId) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="border-t border-gray-100"
                        >
                          <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <p className="text-sm text-gray-600">Items</p>
                                <p className="font-medium text-gray-800">{order.itemDetails.length} items</p>
                              </div>
                              <div className="space-y-2">
                                <p className="text-sm text-gray-600">Estimated Delivery</p>
                                <p className="font-medium text-[#DB4444]">
                                  {order.estimatedDeliveryDate ? 
                                    new Date(order.estimatedDeliveryDate).toLocaleDateString() : 
                                    new Date(new Date(order.timestamp).getTime() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString()
                                  }
                                </p>
                              </div>
                            </div>
                            <div className="mt-6 flex justify-end">
                              <button
                                onClick={() => setSelectedOrder(order)}
                                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-[#DB4444] hover:bg-[#c13a3a] transition-all duration-300 ease-in-out shadow-sm hover:shadow-md transform hover:scale-105"
                              >
                                View Details
                                <ChevronRight className="w-4 h-4 ml-2" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          products={products}
        />
      )}
    </div>
  );
};

export default OrdersPage; 