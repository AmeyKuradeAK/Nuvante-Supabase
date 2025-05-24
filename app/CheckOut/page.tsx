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
    email: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const isFormValid = () => {
    return (
      formData.firstName.trim() !== '' &&
      formData.lastName.trim() !== '' &&
      formData.address.trim() !== '' &&
      formData.city.trim() !== '' &&
      formData.phone.trim() !== '' &&
      formData.email.trim() !== ''
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
        items: products,
        itemDetails: products.map((product, index) => ({
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
          email: formData.email
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
        throw new Error('Failed to save order');
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
    } catch (error) {
      console.error('Error saving order:', error);
      showAlert('Payment successful but failed to save order. Please contact support.', 'error');
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Order Summary Card */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Order Summary</h2>
                <div className="space-y-4">
                  {products.map(product => (
                    <div key={product._id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-20 h-20 relative">
                        <img
                          src={product.productImages[0]}
                          alt={product.productName}
                          className="w-full h-full object-contain rounded-lg"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-800">{product.productName}</h3>
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">Size: {sizes[product._id] || 'Not selected'}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center border rounded-md">
                              <button
                                onClick={() => handleQuantityChange(product._id, -1)}
                                className="px-3 py-1 text-gray-600 hover:bg-gray-100 transition-colors"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                value={quantities[product._id] || 1}
                                onChange={(e) => handleQuantityChange(product._id, parseInt(e.target.value) || 1)}
                                className="w-12 text-center border-x focus:outline-none focus:ring-2 focus:ring-[#DB4444] focus:border-transparent"
                                min={1}
                              />
                              <button
                                onClick={() => handleQuantityChange(product._id, 1)}
                                className="px-3 py-1 text-gray-600 hover:bg-gray-100 transition-colors"
                              >
                                +
                              </button>
                            </div>
                            <p className="text-[#DB4444] font-semibold">
                              Rs. {product.productPrice * (quantities[product._id] || 1)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Billing Details Form */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h1 className="text-2xl font-bold mb-6 text-gray-800">Billing Details</h1>
                <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name <span className="text-[#DB4444]">*</span>
                    </label>
                    <input
                      name="firstName"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DB4444] focus:border-transparent transition-all duration-200"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name <span className="text-[#DB4444]">*</span>
                    </label>
                    <input
                      name="lastName"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DB4444] focus:border-transparent transition-all duration-200"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address <span className="text-[#DB4444]">*</span>
                    </label>
                    <input
                      name="address"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DB4444] focus:border-transparent transition-all duration-200"
                      type="text"
                      required
                      value={formData.address}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Apartment, Floor, etc.
                    </label>
                    <input
                      name="apartment"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DB4444] focus:border-transparent transition-all duration-200"
                      type="text"
                      value={formData.apartment}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Town/City <span className="text-[#DB4444]">*</span>
                    </label>
                    <input
                      name="city"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DB4444] focus:border-transparent transition-all duration-200"
                      type="text"
                      required
                      value={formData.city}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number <span className="text-[#DB4444]">*</span>
                    </label>
                    <input
                      name="phone"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DB4444] focus:border-transparent transition-all duration-200"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address <span className="text-[#DB4444]">*</span>
                    </label>
                    <input
                      name="email"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DB4444] focus:border-transparent transition-all duration-200"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                </form>
              </div>
            </div>

            {/* Payment Summary */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-4"
            >
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
                <h2 className="text-xl font-bold mb-6 text-gray-800">Payment Summary</h2>
                <div className="space-y-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({products.length} items)</span>
                    <span>Rs. {calculateTotal()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="text-[#DB4444]">Free</span>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>Rs. {calculateTotal()}</span>
                    </div>
                  </div>
                  <div className="pt-4">
                    <PaymentButton
                      amount={calculateTotal()}
                      currency="INR"
                      receipt={`ORDER_${Date.now()}`}
                      notes={{
                        items: JSON.stringify(products.map(p => ({
                          id: p._id,
                          quantity: quantities[p._id] || 1,
                          size: sizes[p._id] || ''
                        })))
                      }}
                      onSuccess={handlePaymentSuccess}
                      className="w-full bg-[#DB4444] text-white font-medium py-2.5 px-4 rounded-md hover:bg-black transition-colors duration-200"
                    >
                      Pay Rs. {calculateTotal()}
                    </PaymentButton>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </>
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
