"use client";

import React, { useContext, useState, useEffect, Suspense } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { GlobalContext } from "@/context/Global";
import { useAlert } from "@/context/AlertContext";
import PaymentButton from "@/components/PaymentButton";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";

interface CartData {
  cart: string[];
  cartQuantities: Map<string, number>;
  cartSizes: Map<string, string>;
}

interface QuantitiesResponse {
  quantities: { [key: string]: number };
}

interface SizesResponse {
  sizes: { [key: string]: string };
}

interface OrderData {
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

interface ProfileResponse {
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  cart: string[];
  wishlist: string[];
  orders: any[];
}

const CheckoutContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showAlert } = useAlert();
  const globalContext = useContext(GlobalContext);
  const user = useUser();

  if (!globalContext) {
    throw new Error("CheckoutPage must be used within GlobalContextProvider");
  }

  const { GlobalCart, changeGlobalOrders, clearGlobalCart } = globalContext;
  const [products, setProducts] = useState<any[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [sizes, setSizes] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    city: '',
    phone: '',
    email: '',
    pin: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Update profile when any of these fields change
    if (name === 'email' || name === 'phone' || name === 'firstName' || name === 'lastName') {
      updateProfileField(name, value);
    }
  };

  const updateProfileField = async (field: string, value: string) => {
    try {
      const fieldMap = {
        'email': 'email',
        'phone': 'mobileNumber',
        'firstName': 'firstName',
        'lastName': 'lastName'
      };

      await axios.post("/api/populate", {
        [fieldMap[field as keyof typeof fieldMap]]: value
      });
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      showAlert(`Error updating ${field}`, "error");
    }
  };

  const isFormValid = () => {
    return (
      formData.firstName.trim() !== '' &&
      formData.lastName.trim() !== '' &&
      formData.address.trim() !== '' &&
      formData.city.trim() !== '' &&
      formData.phone.trim() !== '' &&
      formData.email.trim() !== '' &&
      formData.pin.trim() !== ''
    );
  };

  const handleQuantityChange = async (productId: string, delta: number) => {
    const newQuantity = (quantities[productId] || 1) + delta;
    if (newQuantity < 1) return;

    // Update local state
    setQuantities(prev => ({
      ...prev,
      [productId]: newQuantity
    }));

    // If it's a cart item, update the cart
    if (!searchParams.get('product')) {
      try {
        await axios.post("/api/cart", {
          identifier: productId,
          append: true,
          quantity: newQuantity
        });
      } catch (error) {
        console.error("Error updating quantity:", error);
        showAlert("Error updating quantity", "error");
      }
    }
  };

  useEffect(() => {
    const fetchCartData = async () => {
      try {
        // Get all product IDs from URL
        const productIds = searchParams.getAll('product');
        const sizes = searchParams.getAll('size');
        const quantities = searchParams.getAll('quantity');

        // Fetch user profile data
        const profileResponse = await axios.get<ProfileResponse>("/api/propagation_client");
        if (profileResponse.data) {
          setFormData(prev => ({
            ...prev,
            firstName: profileResponse.data.firstName || '',
            lastName: profileResponse.data.lastName || '',
            email: profileResponse.data.email || '',
            phone: profileResponse.data.mobileNumber || ''
          }));
        }

        if (productIds.length > 0) {
          // Fetch all products from URL parameters
          const productPromises = productIds.map(async (productId, index) => {
            const response = await axios.post("/api/propagation", {
              id: productId,
              every: false
            });
            return response.data;
          });

          const productsData = await Promise.all(productPromises);
          setProducts(productsData);

          // Set quantities and sizes from URL parameters
          const quantitiesMap: Record<string, number> = {};
          const sizesMap: Record<string, string> = {};
          
          productIds.forEach((productId, index) => {
            quantitiesMap[productId] = parseInt(quantities[index] || '1');
            sizesMap[productId] = sizes[index] || '';
          });

          setQuantities(quantitiesMap);
          setSizes(sizesMap);
        } else {
          // Fetch all products in cart
          const productPromises = GlobalCart.map(async (itemId: string) => {
            const response = await axios.post("/api/propagation", {
              id: itemId,
              every: false
            });
            return response.data;
          });

          const productsData = await Promise.all(productPromises);
          setProducts(productsData);

          // Load quantities from database
          const quantitiesResponse = await axios.get<QuantitiesResponse>('/api/cart/quantities');
          if (quantitiesResponse.status === 200 && quantitiesResponse.data.quantities) {
            setQuantities(quantitiesResponse.data.quantities);
          }

          // Load sizes from database
          const sizesResponse = await axios.get<SizesResponse>('/api/cart/size');
          if (sizesResponse.status === 200 && sizesResponse.data.sizes) {
            setSizes(sizesResponse.data.sizes);
          }
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching cart data:", error);
        showAlert("Error loading cart data", "error");
        setIsLoading(false);
      }
    };

    if (!user.isSignedIn) {
      showAlert("Please sign in to access checkout", "warning");
      router.push("/sign-in");
      return;
    }

    fetchCartData();
  }, [user.isSignedIn, showAlert, router, searchParams, GlobalCart]);

  const calculateTotal = () => {
    return products.reduce((total, item) => {
      const quantity = quantities[item._id] || 1;
      return total + (quantity * item.productPrice);
    }, 0);
  };

  const handlePaymentSuccess = async (paymentId: string, orderId: string) => {
    try {
      // Create order data
      const orderData = {
        orderId,
        paymentId,
        amount: calculateTotal(),
        currency: 'INR',
        status: 'completed',
        timestamp: new Date().toISOString(),
        estimatedDeliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
        items: products.map(p => p._id),
        trackingId: `TRK${Date.now()}`, // Generate a unique tracking ID
        itemStatus: 'processing', // Initial status for the order
        itemDetails: products.map((product) => ({
          productId: product._id,
          size: sizes[product._id] || '',
          quantity: quantities[product._id] || 1
        })),
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          streetAddress: formData.address,
          apartment: formData.apartment,
          city: formData.city,
          phone: formData.phone,
          email: formData.email,
          pin: formData.pin
        }
      };

      // Save order to database
      const saveResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json();
        throw new Error(errorData.message || 'Failed to save order');
      }

      // Update orders in global context
      changeGlobalOrders(orderData);

      // Clear cart after successful payment
      clearGlobalCart();

      // Close Razorpay modal
      const modal = document.querySelector('.razorpay-checkout-frame');
      if (modal) {
        modal.remove();
      }
      // Force close any remaining Razorpay elements
      const overlay = document.querySelector('.razorpay-overlay');
      if (overlay) {
        overlay.remove();
      }

      // Show success message and redirect
      showAlert('Payment successful!', 'success');
      window.location.href = `/payment-success?orderId=${orderId}&paymentId=${paymentId}`;
    } catch (error: any) {
      console.error('Error saving order:', error);
      showAlert(error.message || 'Payment successful but failed to save order. Please contact support.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/" className="text-gray-600 hover:text-[#DB4444] transition-colors duration-300 ease-in-out">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-[#DB4444]">Checkout</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-[#DB4444] border-t-transparent rounded-full animate-spin"></div>
              <Image 
                src="/logo.png" 
                alt="Loading..." 
                width={40} 
                height={40} 
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse"
              />
            </div>
          </div>
        )}

        {!isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Checkout Section */}
            <div className="lg:col-span-8">
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 ease-in-out"
              >
                <div className="p-6 border-b border-gray-100">
                  <h1 className="text-2xl font-bold text-gray-800">Checkout</h1>
                </div>

                <div className="p-6 space-y-8">
                  {/* Shipping Information */}
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-6"
                  >
                    <h2 className="text-xl font-semibold text-gray-800">Shipping Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <motion.div whileHover={{ scale: 1.02 }} className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">First Name</label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DB4444] focus:border-transparent transition-all duration-300"
                          placeholder="Enter your first name"
                        />
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.02 }} className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Last Name</label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DB4444] focus:border-transparent transition-all duration-300"
                          placeholder="Enter your last name"
                        />
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.02 }} className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-gray-700">Street Address</label>
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DB4444] focus:border-transparent transition-all duration-300"
                          placeholder="Enter your street address"
                        />
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.02 }} className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Apartment/Suite (Optional)</label>
                        <input
                          type="text"
                          name="apartment"
                          value={formData.apartment}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DB4444] focus:border-transparent transition-all duration-300"
                          placeholder="Enter apartment or suite number"
                        />
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.02 }} className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">City</label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DB4444] focus:border-transparent transition-all duration-300"
                          placeholder="Enter your city"
                        />
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.02 }} className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Phone Number</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DB4444] focus:border-transparent transition-all duration-300"
                          placeholder="Enter your phone number"
                        />
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.02 }} className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DB4444] focus:border-transparent transition-all duration-300"
                          placeholder="Enter your email"
                        />
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.02 }} className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">PIN Code</label>
                        <input
                          type="text"
                          name="pin"
                          value={formData.pin}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DB4444] focus:border-transparent transition-all duration-300"
                          placeholder="Enter your PIN code"
                          maxLength={6}
                          pattern="[0-9]{6}"
                        />
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Order Items */}
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-6"
                  >
                    <h2 className="text-xl font-semibold text-gray-800">Order Items</h2>
                    <div className="space-y-4">
                      {products.map((product, index) => (
                        <motion.div
                          key={product._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.02 }}
                          className="flex items-center gap-6 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-300"
                        >
                          <div className="w-20 h-20 relative shrink-0 group">
                            <img
                              src={product.productImages[0]}
                              alt={product.productName}
                              className="w-full h-full object-cover rounded-lg transition-transform duration-300 group-hover:scale-110"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-800 truncate group-hover:text-[#DB4444] transition-colors duration-300">
                              {product.productName}
                            </h3>
                            <div className="mt-2 flex items-center gap-4">
                              <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-600">Size: {sizes[product._id] || 'Not selected'}</span>
                                <div className="flex items-center border rounded-lg overflow-hidden">
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleQuantityChange(product._id, -1)}
                                    className="px-3 py-1 text-gray-600 hover:bg-gray-100 transition-all duration-300"
                                  >
                                    -
                                  </motion.button>
                                  <span className="px-3 py-1 border-x text-center">
                                    {quantities[product._id] || 1}
                                  </span>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleQuantityChange(product._id, 1)}
                                    className="px-3 py-1 text-gray-600 hover:bg-gray-100 transition-all duration-300"
                                  >
                                    +
                                  </motion.button>
                                </div>
                              </div>
                              <span className="text-[#DB4444] font-semibold">
                                Rs. {product.productPrice * (quantities[product._id] || 1)}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* Order Summary Section */}
            <div className="lg:col-span-4">
              <div className="sticky top-8 space-y-6">
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 ease-in-out p-6"
                >
                  <h2 className="text-xl font-bold mb-6 text-gray-800">Order Summary</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal ({products.length} items)</span>
                      <span className="font-medium">Rs. {calculateTotal()}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span className="text-[#DB4444] font-medium">Free</span>
                    </div>
                    <div className="border-t border-gray-100 pt-4">
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span className="text-[#DB4444]">Rs. {calculateTotal()}</span>
                      </div>
                    </div>
                    <div className="pt-4">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <PaymentButton
                          amount={calculateTotal()}
                          onSuccess={handlePaymentSuccess}
                          disabled={!isFormValid()}
                          className={`w-full bg-[#DB4444] text-white font-medium py-3 px-4 rounded-lg hover:bg-black transition-colors duration-300 ${!isFormValid() ? 'opacity-50 cursor-not-allowed' : ''}`}
                          receipt={`ORDER_${Date.now()}`}
                        >
                          Pay Rs. {calculateTotal()}
                        </PaymentButton>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>

                {/* Help Card */}
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 ease-in-out p-6"
                >
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Need Help?</h3>
                  <div className="space-y-3">
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center text-gray-600 hover:text-[#DB4444] transition-all duration-300 cursor-pointer group"
                    >
                      <svg className="w-5 h-5 mr-2 text-[#DB4444] group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span>Chat with us</span>
                    </motion.div>
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center text-gray-600 hover:text-[#DB4444] transition-all duration-300 cursor-pointer group"
                    >
                      <svg className="w-5 h-5 mr-2 text-[#DB4444] group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span>+91 9899044148</span>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

const CheckoutPage = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#DB4444]"></div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
};

export default CheckoutPage;
