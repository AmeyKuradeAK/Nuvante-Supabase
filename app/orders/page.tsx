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
    productName: string;
    productPrice: number;
    productImages: string[];
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

const OrderDetailsModal = ({ order, onClose, products }: OrderDetailsModalProps) => {
  // Calculate expected delivery date (5 days from order date)
  const orderDate = new Date(order.timestamp);
  const expectedDeliveryDate = new Date(orderDate);
  expectedDeliveryDate.setDate(orderDate.getDate() + 5);

  // Get order items with their details
  const orderItems = products.filter(product => 
    order.items.some(itemId => itemId === product._id.toString())
  );

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
      console.log("Fetching orders and products...");
      const [response, productsResponse] = await Promise.all([
        axios.get<ApiResponseOr404>("/api/propagation_client"),
        axios.post<{ data: any[] }>("/api/propagation", { every: true })
      ]);
      
      console.log("Orders Response:", response.data);
      console.log("Products Response:", productsResponse.data);
      
      if (response.data === 404 || !response.data) {
        console.error("Could not fetch orders data");
        setOrders([]);
      } else {
        const { orders = [] } = response.data;
        console.log("Parsed Orders:", orders);
        // Sort orders by date (latest first)
        const sortedOrders = orders.sort((a, b) => 
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
          
          {orders.length > 0 ? (
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
                    {order.itemDetails.map((item) => (
                      <div key={item.productId} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="w-20 h-20 relative">
                          <img
                            src={item.productImages?.[0]}
                            alt={item.productName}
                            className="w-full h-full object-cover rounded-md"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-800">{item.productName}</h3>
                          <p className="text-sm text-gray-600">Size: {item.size}</p>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                          <p className="text-[#DB4444] font-semibold">
                            Rs. {item.productPrice * item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-600">Payment ID: {order.paymentId}</p>
                        <p className="text-sm text-gray-600">
                          Total Amount: Rs. {order.amount} {order.currency}
                        </p>
                      </div>
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
    </>
  );
};

export default OrdersPage; 