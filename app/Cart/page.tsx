"use client";
import React, { useContext, useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import axios from "axios";
import { GlobalContext } from "@/context/Global";
import Button from "@/components/button";
import { motion } from "framer-motion";
import { useAlert } from "@/context/AlertContext";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Image from "next/image";

const logo = "/logo.png";

interface Product {
  _id: string;
  productName: string;
  productPrice: number;
  productImages: string[];
}

interface QuantitiesResponse {
  quantities: { [key: string]: number };
}

const CartPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const { showAlert } = useAlert();
  const user = useUser();
  const router = useRouter();
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});

  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error("GlobalContext is not provided.");
  }

  const { GlobalCart, changeGlobalCart } = context;

  useEffect(() => {
    const checkAuth = async () => {
      if (!user.isSignedIn) {
        showAlert("Please sign in to access your cart", "warning");
        router.push("/sign-in");
        return;
      }
      await asyncHandler();
    };
    
    checkAuth();
  }, [user.isSignedIn, showAlert, router]);

  const asyncHandler = async () => {
    try {
      const response = await axios
        .post<Product[]>(`/api/propagation`, {
          every: true,
        })
        .then((res) => {
          if (res.status === 404) {
            showAlert("Error fetching cart products. Please try again.", "error");
            setTimeout(() => {
              window.location.href = "/";
            }, 2000);
          } else {
            setProducts(res.data || []);
          }
        });

      // Load quantities from database
      const quantitiesResponse = await axios.get<QuantitiesResponse>('/api/cart/quantities');
      if (quantitiesResponse.status === 200 && quantitiesResponse.data.quantities) {
        // Ensure all quantities are at least 1
        const normalizedQuantities = Object.entries(quantitiesResponse.data.quantities).reduce(
          (acc, [key, value]) => ({
            ...acc,
            [key]: Math.max(1, value)
          }),
          {}
        );
        setQuantities(normalizedQuantities);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      showAlert("Error loading cart. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (id: string, value: number) => {
    try {
      const newValue = Math.max(1, value); // Ensure minimum quantity is 1
      const newQuantities = {
        ...quantities,
        [id]: newValue,
      };
      
      // Update local state
      setQuantities(newQuantities);

      // Update database
      const response = await axios.post('/api/cart/quantity', {
        productId: id,
        quantity: newValue
      });

      if (response.status !== 200) {
        showAlert("Failed to update quantity. Please try again.", "error");
        // Revert to previous quantity on error
        setQuantities(prev => ({
          ...prev,
          [id]: prev[id]
        }));
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      showAlert("Error updating quantity. Please try again.", "error");
      // Revert to previous quantity on error
      setQuantities(prev => ({
        ...prev,
        [id]: prev[id]
      }));
    }
  };

  const calculateSubtotal = () => {
    return products.reduce((total, item) => {
      if (!GlobalCart.includes(item._id)) return total;
      return total + (quantities[item._id] || 1) * item.productPrice;
    }, 0);
  };

  const handleRemoveItem = async (id: string) => {
    try {
      const response = await axios.post(`/api/cart`, {
        append: false,
        identifier: id,
      });
      
      if (response.status === 200) {
        // Remove from cart
        changeGlobalCart(id);
        
        // Remove quantity from state
        const newQuantities = { ...quantities };
        delete newQuantities[id];
        setQuantities(newQuantities);
        
        showAlert("Item removed from cart", "success");
      } else {
        showAlert("Failed to remove item. Please try again.", "error");
      }
    } catch (error) {
      console.error("Error removing item:", error);
      showAlert("Error removing item. Please try again.", "error");
    }
  };

  const handleReturnToShop = () => {
    window.location.href = "/";
  };

  const cartItems = products.filter(item => GlobalCart.includes(item._id));
  const subtotal = calculateSubtotal();

  const handleSizeSelect = async (productId: string, size: string) => {
    setSelectedSizes(prev => ({
      ...prev,
      [productId]: size
    }));

    try {
      await axios.post("/api/cart", {
        identifier: productId,
        append: true,
        size: size
      });
      showAlert("Size updated successfully", "success");
    } catch (error) {
      console.error("Error updating size:", error);
      showAlert("Error updating size", "error");
      // Revert the size selection on error
      setSelectedSizes(prev => ({
        ...prev,
        [productId]: prev[productId]
      }));
    }
  };

  const handleCheckout = () => {
    // Check if all items have sizes selected
    const allItemsHaveSizes = products.every(product => selectedSizes[product._id]);
    
    if (!allItemsHaveSizes) {
      showAlert("Please select sizes for all items before checkout", "error");
      return;
    }

    router.push("/CheckOut");
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {loading && (
          <div className="h-screen flex items-center justify-center">
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
                alt="preloader" 
                width={60} 
                height={60}
                className="relative z-10"
                style={{ background: 'transparent' }}
              />
            </motion.div>
          </div>
        )}
        {!loading && (
          <>
            <Navbar />
            <main className="container mx-auto px-4 py-8">
              <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem>
                        <BreadcrumbLink href="/">Home</BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbPage>Cart</BreadcrumbPage>
                      </BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Main Cart Section */}
                  <div className="lg:col-span-8">
                    <div className="bg-white rounded-lg shadow-sm">
                      <div className="p-6 border-b border-gray-200">
                        <h1 className="text-2xl font-bold">Shopping Cart ({cartItems.length} items)</h1>
                      </div>

                      {cartItems.length === 0 ? (
                        <div className="p-12 text-center">
                          <div className="w-20 h-20 mx-auto mb-6 text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </div>
                          <h2 className="text-xl font-semibold text-gray-800 mb-2">Your cart is empty</h2>
                          <p className="text-gray-600 mb-6">Looks like you haven't added anything to your cart yet.</p>
                          <div onClick={handleReturnToShop} className="inline-block">
                            <Button text="Continue Shopping" width={200} />
                          </div>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-200">
                          {cartItems.map((item) => (
                            <div key={item._id} className="p-6">
                              <div className="flex flex-col md:flex-row gap-6 items-start">
                                {/* Product Image */}
                                <div className="w-full md:w-24 h-32 relative group shrink-0">
                                  <img
                                    src={item.productImages[0]}
                                    alt={item.productName}
                                    className="w-full h-full object-contain rounded-lg transition-transform group-hover:scale-105"
                                  />
                                </div>

                                {/* Product Details */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                      <h3 className="text-lg font-medium text-gray-800">{item.productName}</h3>
                                      <p className="text-sm text-gray-500 mt-1">Product ID: {item._id.slice(-6)}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                      <div className="text-lg font-semibold text-[#DB4444]">
                                        Rs. {item.productPrice}
                                      </div>
                                      <button
                                        onClick={() => handleRemoveItem(item._id)}
                                        className="text-gray-400 hover:text-[#DB4444] transition-colors"
                                        aria-label="Remove item"
                                      >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                      </button>
                                    </div>
                                  </div>

                                  {/* Size Selection */}
                                  <div className="mt-4">
                                    <h2 className="text-sm font-medium mb-3">Select Size</h2>
                                    <div className="grid grid-cols-4 gap-2 max-w-xs">
                                      {["S", "M", "L", "XL"].map((size) => (
                                        <button
                                          key={size}
                                          className={`border-2 py-2 text-center transition-colors ${
                                            selectedSizes[item._id] === size
                                              ? "bg-black text-white border-black"
                                              : "border-gray-200 hover:border-gray-300"
                                          }`}
                                          onClick={() => handleSizeSelect(item._id, size)}
                                        >
                                          {size}
                                        </button>
                                      ))}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                      This product has a larger fit than usual. Model is wearing L.
                                    </p>
                                  </div>

                                  {/* Quantity Controls */}
                                  <div className="mt-4 flex items-center gap-4">
                                    <div className="flex items-center border rounded-md">
                                      <button
                                        onClick={() => handleQuantityChange(item._id, (quantities[item._id] || 1) - 1)}
                                        className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                                      >
                                        -
                                      </button>
                                      <input
                                        type="number"
                                        value={quantities[item._id] || 1}
                                        onChange={(e) => handleQuantityChange(item._id, parseInt(e.target.value) || 1)}
                                        className="w-16 text-center border-x focus:outline-none focus:ring-2 focus:ring-[#DB4444] focus:border-transparent"
                                        min={1}
                                      />
                                      <button
                                        onClick={() => handleQuantityChange(item._id, (quantities[item._id] || 1) + 1)}
                                        className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                                      >
                                        +
                                      </button>
                                    </div>
                                    <div className="text-gray-600">
                                      Subtotal: <span className="font-semibold">Rs. {(quantities[item._id] || 1) * item.productPrice}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Summary Section */}
                  <div className="lg:col-span-4">
                    <div className="sticky top-8 space-y-6">
                      {/* Order Summary Card */}
                      <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-xl font-bold mb-6">Order Summary</h2>
                        <div className="space-y-4">
                          <div className="flex justify-between text-gray-600">
                            <span>Subtotal ({cartItems.length} items)</span>
                            <span>Rs. {subtotal}</span>
                          </div>
                          <div className="flex justify-between text-gray-600">
                            <span>Shipping</span>
                            <span className="text-[#DB4444]">Free</span>
                          </div>
                          <div className="border-t border-gray-200 pt-4">
                            <div className="flex justify-between font-bold text-lg">
                              <span>Total</span>
                              <span>Rs. {subtotal}</span>
                            </div>
                          </div>
                          <div className="pt-4">
                            <Button 
                              text="Proceed to Checkout" 
                              width={250} 
                              onClick={handleCheckout}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Coupon Card */}
                      <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="text-lg font-semibold mb-4">Apply Coupon</h3>
                        <div className="space-y-4">
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Enter coupon code"
                              className="w-full px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DB4444] focus:border-transparent"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                              </svg>
                            </div>
                          </div>
                          <Button text="Apply Coupon" width={250} />
                        </div>
                      </div>

                      {/* Help Card */}
                      <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="text-lg font-semibold mb-4">Need Help?</h3>
                        <div className="space-y-3">
                          <div className="flex items-center text-gray-600">
                            <svg className="w-5 h-5 mr-2 text-[#DB4444]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span>Chat with us</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <svg className="w-5 h-5 mr-2 text-[#DB4444]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <span>+91 9899044148</span>
                          </div>
                          <a href="/faq" className="flex items-center text-gray-600 hover:text-[#DB4444] transition-colors">
                            <svg className="w-5 h-5 mr-2 text-[#DB4444]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>View FAQs</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </main>
            <Footer />
          </>
        )}
      </div>
    </>
  );
};

export default CartPage;
