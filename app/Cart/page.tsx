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

interface QuantitiesResponse {
  quantities: { [key: string]: number };
}

interface SizesResponse {
  sizes: { [key: string]: string };
}

interface CouponValidationResponse {
  valid: boolean;
  message: string;
  coupon?: {
    code: string;
    description: string;
    type: string;
    value: number;
    discount: number;
    remainingUses: number;
    expirationDate: string;
  };
}

const CartPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const { showAlert } = useAlert();
  const user = useUser();
  const router = useRouter();
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  
  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);

  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error("GlobalContext is not provided.");
  }

  const { GlobalCart, changeGlobalCart } = context;

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!user.isSignedIn) {
          showAlert("Please sign in to access your cart", "warning");
          router.push("/sign-in");
          return;
        }
        await asyncHandler();
      } catch (error) {
        console.error("Error in checkAuth:", error);
        showAlert("Error loading cart. Please try again.", "error");
        setLoading(false);
      }
    };
    
    if (user.isLoaded) {  // Only check auth after user state is loaded
      checkAuth();
    }
  }, [user.isLoaded, user.isSignedIn, showAlert, router]);

  const asyncHandler = async () => {
    try {
      const response = await axios.post<Product[]>(`/api/propagation`, {
        every: true,
      });

      if (response.status === 404) {
        showAlert("Error fetching cart products. Please try again.", "error");
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
        return;
      } 
      
      const productData = response.data || [];
      setProducts(productData);

      // Only fetch quantities and sizes if there are items in the cart
      if (GlobalCart && GlobalCart.length > 0) {
        try {
          // Load quantities from database with cache busting
          const quantitiesResponse = await axios.get<QuantitiesResponse>('/api/cart/quantities', {
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            }
          });
          let normalizedQuantities: { [key: string]: number } = {};
          
          if (quantitiesResponse.status === 200 && quantitiesResponse.data?.quantities) {
            normalizedQuantities = Object.entries(quantitiesResponse.data.quantities).reduce(
              (acc, [key, value]) => ({
                ...acc,
                [key]: Math.max(1, Number(value) || 1)
              }),
              {}
            );
          }

          // Ensure all cart items have default quantities set
          const allQuantities = { ...normalizedQuantities };
          for (const itemId of GlobalCart) {
            if (!allQuantities[itemId]) {
              allQuantities[itemId] = 1;
              // Also set default quantity in database
              try {
                await axios.post('/api/cart/quantity', {
                  productId: itemId,
                  quantity: 1
                }, {
                  headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                  }
                });
              } catch (error) {
                console.error(`Error setting default quantity for ${itemId}:`, error);
              }
            }
          }
          
          setQuantities(allQuantities);

          // Load sizes from database with cache busting
          const sizesResponse = await axios.get<SizesResponse>('/api/cart/size', {
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            }
          });
          if (sizesResponse.status === 200 && sizesResponse.data?.sizes) {
            setSelectedSizes(sizesResponse.data.sizes);
          }
        } catch (error) {
          console.error("Error fetching cart details:", error);
          // Don't show alert for empty cart cases
          if (GlobalCart.length > 0) {
            showAlert("Error loading cart details. Please try again.", "error");
          }
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      showAlert("Error loading cart. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleReturnToShop = () => {
    router.push("/");
  };

  const calculateSubtotal = () => {
    if (!products || !GlobalCart) return 0;
    
    return products.reduce((total, item) => {
      if (!GlobalCart.includes(item._id)) return total;
      const quantity = quantities[item._id] || 1;
      const price = Number(item.productPrice) || 0;
      return total + (quantity * price);
    }, 0);
  };

  const cartItems = products.filter(item => GlobalCart && GlobalCart.includes(item._id)) || [];
  const subtotal = calculateSubtotal();
  const finalTotal = Math.round((subtotal - couponDiscount) * 100) / 100; // Fix floating point precision

  // Coupon handlers
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      showAlert("Please enter a coupon code", "warning");
      return;
    }

    if (subtotal <= 0) {
      showAlert("Cart is empty", "warning");
      return;
    }

    setCouponLoading(true);
    try {
      const response = await axios.post<CouponValidationResponse>('/api/coupons/validate', {
        couponCode: couponCode.trim(),
        orderAmount: subtotal
      });

      if (response.data.valid) {
        setAppliedCoupon(response.data.coupon);
        setCouponDiscount(response.data.coupon?.discount || 0);
        showAlert(`Coupon applied! You saved Rs. ${response.data.coupon?.discount || 0}`, "success");
      } else {
        showAlert(response.data.message || "Invalid coupon code", "error");
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || "Failed to apply coupon";
      showAlert(errorMessage, "error");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponCode('');
    showAlert("Coupon removed", "info");
  };

  const handleSizeSelect = async (productId: string, size: string) => {
    if (!productId || !size) return;
    
    // Check if the product exists and get its sold out sizes
    const product = products.find(p => p._id === productId);
    if (product && product.soldOut) {
      showAlert("This product is currently sold out", "warning");
      return;
    }
    
    if (product && product.soldOutSizes && product.soldOutSizes.includes(size)) {
      showAlert(`Size ${size} is currently sold out. Please select another size.`, "warning");
      return;
    }
    
    try {
      // Update local state first
      setSelectedSizes(prev => ({
        ...prev,
        [productId]: size
      }));

      // Update database
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
        [productId]: prev[productId] || ""
      }));
    }
  };

  const handleQuantityChange = async (id: string, value: number) => {
    if (!id) return;
    
    // Check if size is selected before allowing quantity change
    if (!selectedSizes[id]) {
      showAlert("Please select a size first", "warning");
      return;
    }

    try {
      const newValue = Math.max(1, Number(value) || 1); // Ensure minimum quantity is 1
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
      }, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      if (response.status !== 200) {
        showAlert("Failed to update quantity. Please try again.", "error");
        // Revert to previous quantity on error
        setQuantities(prev => ({
          ...prev,
          [id]: prev[id] || 1
        }));
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      showAlert("Error updating quantity. Please try again.", "error");
      // Revert to previous quantity on error
      setQuantities(prev => ({
        ...prev,
        [id]: prev[id] || 1
      }));
    }
  };

  const handleRemoveItem = async (id: string) => {
    if (!id) return;
    
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

        // Remove size from state
        const newSizes = { ...selectedSizes };
        delete newSizes[id];
        setSelectedSizes(newSizes);
        
        showAlert("Item removed from cart", "success");
      } else {
        showAlert("Failed to remove item. Please try again.", "error");
      }
    } catch (error) {
      console.error("Error removing item:", error);
      showAlert("Error removing item. Please try again.", "error");
    }
  };

  const handleCheckout = () => {
    if (!cartItems || cartItems.length === 0) {
      showAlert("Your cart is empty", "warning");
      return;
    }

    // Check if any items are sold out
    const soldOutItems = cartItems.filter(item => item.soldOut);
    if (soldOutItems.length > 0) {
      showAlert("Some items in your cart are sold out. Please remove them before checkout.", "error");
      return;
    }

    // Check if all items have sizes selected
    const allItemsHaveSizes = cartItems.every(item => selectedSizes[item._id]);
    
    if (!allItemsHaveSizes) {
      showAlert("Please select sizes for all items before checkout", "error");
      return;
    }

    // Check if any selected sizes are sold out
    const invalidSizes = cartItems.filter(item => 
      item.soldOutSizes && item.soldOutSizes.includes(selectedSizes[item._id])
    );
    
    if (invalidSizes.length > 0) {
      showAlert("Some selected sizes are sold out. Please update your size selections.", "error");
      return;
    }

    // Check if all items have valid quantities (use same logic as UI with fallback to 1)
    const allItemsHaveQuantities = cartItems.every(item => (quantities[item._id] || 1) >= 1);
    
    if (!allItemsHaveQuantities) {
      showAlert("Please set quantities for all items before checkout", "error");
      return;
    }

    // Build URL with all cart items' sizes and quantities (use fallback to 1 for quantities)
    const queryParams = cartItems.map(item => 
      `product=${encodeURIComponent(item._id)}&size=${encodeURIComponent(selectedSizes[item._id])}&quantity=${encodeURIComponent(quantities[item._id] || 1)}`
    ).join('&');

    // Add coupon information if applied
    let checkoutUrl = `/CheckOut?${queryParams}`;
    if (appliedCoupon) {
      checkoutUrl += `&coupon=${encodeURIComponent(appliedCoupon.code)}&discount=${encodeURIComponent(couponDiscount)}`;
    }

    router.push(checkoutUrl);
  };

  // Safe render function for product images
  const renderProductImage = (item: Product) => {
    const imageUrl = (item.productImages && item.productImages[0]) 
      ? item.productImages[0] 
      : item.thumbnail || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=536&h=354&fit=crop&crop=center";
    
    return (
      <motion.div 
        whileHover={{ scale: 1.05 }}
        className="w-full md:w-24 h-32 relative"
      >
        <img
          src={imageUrl}
          alt={item.productName || "Product"}
          className="w-full h-full object-contain rounded-lg"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=536&h=354&fit=crop&crop=center";
          }}
        />
        {item.soldOut && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
            <span className="text-white text-sm font-medium">SOLD OUT</span>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {loading && (
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
      {!loading && (
        <>
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <div className="max-w-7xl mx-auto">
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
                      <BreadcrumbPage className="text-[#DB4444]">Cart</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Cart Section */}
                <div className="lg:col-span-8">
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 ease-in-out"
                  >
                    <div className="p-6 border-b border-gray-100">
                      <h1 className="text-2xl font-bold text-gray-800">Shopping Cart ({cartItems.length} items)</h1>
                    </div>

                    {cartItems.length === 0 ? (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-12 text-center"
                      >
                        <motion.div 
                          animate={{ y: [0, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          className="w-24 h-24 mx-auto mb-6 text-gray-400"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-full h-full">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </motion.div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Your cart is empty</h2>
                        <p className="text-gray-600 mb-6">Looks like you haven't added anything to your cart yet.</p>
                        <motion.div 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleReturnToShop} 
                          className="inline-block"
                        >
                          <Button text="Continue Shopping" width={200} />
                        </motion.div>
                      </motion.div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {cartItems.map((item, index) => (
                          <motion.div 
                            key={item._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-6 hover:bg-gray-50 transition-all duration-300 ease-in-out group"
                          >
                            <div className="flex flex-col md:flex-row gap-6 items-start">
                              {/* Product Image */}
                              {renderProductImage(item)}

                              {/* Product Details */}
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                  <div>
                                    <h3 className="text-lg font-medium text-gray-800 group-hover:text-[#DB4444] transition-colors duration-300">{item.productName}</h3>
                                    <p className="text-sm text-gray-500 mt-1">Product ID: {item._id.slice(-6)}</p>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <div className="text-lg font-semibold text-[#DB4444]">
                                      Rs. {Number(item.productPrice) || 0}
                                    </div>
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => handleRemoveItem(item._id)}
                                      className="text-gray-400 hover:text-[#DB4444] transition-all duration-300 p-2 hover:bg-gray-100 rounded-full"
                                      aria-label="Remove item"
                                    >
                                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    </motion.button>
                                  </div>
                                </div>

                                {/* Size Selection */}
                                <div className="mt-4">
                                  <h2 className="text-sm font-medium mb-3">Select Size</h2>
                                  {item.soldOut ? (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                      <p className="text-red-600 text-sm font-medium">⚠️ This product is currently sold out</p>
                                    </div>
                                  ) : (
                                    <>
                                      <div className="grid grid-cols-4 gap-2 max-w-xs">
                                        {["S", "M", "L", "XL"].map((size) => {
                                          const isSizeSoldOut = item.soldOutSizes && item.soldOutSizes.includes(size);
                                          const isDisabled = item.soldOut || isSizeSoldOut;
                                          
                                          return (
                                            <motion.button
                                              key={size}
                                              whileHover={!isDisabled ? { scale: 1.05 } : {}}
                                              whileTap={!isDisabled ? { scale: 0.95 } : {}}
                                              disabled={isDisabled}
                                              className={`border-2 py-2 text-center transition-all duration-300 ease-in-out relative ${
                                                isDisabled
                                                  ? "border-gray-200 text-gray-400 cursor-not-allowed bg-gray-100"
                                                  : selectedSizes[item._id] === size
                                                    ? "bg-[#DB4444] text-white border-[#DB4444]"
                                                    : "border-gray-200 hover:border-[#DB4444] hover:text-[#DB4444]"
                                              }`}
                                              onClick={() => !isDisabled && handleSizeSelect(item._id, size)}
                                            >
                                              {size}
                                              {isSizeSoldOut && !item.soldOut && (
                                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded-full">
                                                  ✕
                                                </span>
                                              )}
                                            </motion.button>
                                          );
                                        })}
                                      </div>
                                      <p className="text-xs text-gray-500 mt-2">
                                        This product has a larger fit than usual. Model is wearing L.
                                      </p>
                                      {item.soldOutSizes && item.soldOutSizes.length > 0 && !item.soldOut && (
                                        <p className="text-xs text-red-500 mt-2">
                                          Sizes {item.soldOutSizes.join(", ")} are currently sold out
                                        </p>
                                      )}
                                    </>
                                  )}
                                </div>

                                {/* Quantity Controls */}
                                {selectedSizes[item._id] && !item.soldOut && (
                                  <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-4 flex items-center gap-4"
                                  >
                                    <div className="flex items-center border rounded-lg overflow-hidden">
                                      <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => handleQuantityChange(item._id, (quantities[item._id] || 1) - 1)}
                                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 transition-all duration-300 ease-in-out hover:text-[#DB4444]"
                                      >
                                        -
                                      </motion.button>
                                      <input
                                        type="number"
                                        value={quantities[item._id] || 1}
                                        onChange={(e) => handleQuantityChange(item._id, parseInt(e.target.value) || 1)}
                                        className="w-16 text-center border-x focus:outline-none focus:ring-2 focus:ring-[#DB4444] focus:border-transparent transition-all duration-300"
                                        min={1}
                                      />
                                      <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => handleQuantityChange(item._id, (quantities[item._id] || 1) + 1)}
                                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 transition-all duration-300 ease-in-out hover:text-[#DB4444]"
                                      >
                                        +
                                      </motion.button>
                                    </div>
                                    <div className="text-gray-600">
                                      Subtotal: <span className="font-semibold text-[#DB4444]">Rs. {(quantities[item._id] || 1) * (Number(item.productPrice) || 0)}</span>
                                    </div>
                                  </motion.div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                </div>

                {/* Order Summary Section */}
                <div className="lg:col-span-4">
                  <div className="sticky top-8 space-y-6">
                    {/* Order Summary Card */}
                    <motion.div 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 ease-in-out p-6"
                    >
                      <h2 className="text-xl font-bold mb-6 text-gray-800">Order Summary</h2>
                      <div className="space-y-4">
                        <div className="flex justify-between text-gray-600">
                          <span>Subtotal ({cartItems.length} items)</span>
                          <span className="font-medium">Rs. {subtotal}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <span>Shipping</span>
                          <span className="text-[#DB4444] font-medium">Free</span>
                        </div>
                        {appliedCoupon && (
                          <div className="flex justify-between text-green-600">
                            <span className="flex-shrink-0">Coupon Discount ({appliedCoupon.code})</span>
                            <span className="font-medium ml-2 whitespace-nowrap">-Rs. {Math.round(couponDiscount * 100) / 100}</span>
                          </div>
                        )}
                        <div className="border-t border-gray-100 pt-4">
                          <div className="flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span className="text-[#DB4444]">Rs. {finalTotal}</span>
                          </div>
                        </div>
                        <div className="pt-4">
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button 
                              text="Proceed to Checkout" 
                              width={250} 
                              onClick={handleCheckout}
                              disabled={cartItems.length === 0}
                              className={`${cartItems.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                            />
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Coupon Card */}
                    <motion.div 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 ease-in-out p-6"
                    >
                      <h3 className="text-lg font-semibold mb-4 text-gray-800">Apply Coupon</h3>
                      <div className="space-y-4">
                        {!appliedCoupon ? (
                          <>
                            <div className="relative">
                              <input
                                type="text"
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                placeholder="Enter coupon code"
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DB4444] focus:border-transparent transition-all duration-300"
                                onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                              />
                              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                </svg>
                              </div>
                            </div>
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Button 
                                text={couponLoading ? "Applying..." : "Apply Coupon"} 
                                width={250} 
                                onClick={handleApplyCoupon}
                                disabled={couponLoading || !couponCode.trim()}
                              />
                            </motion.div>
                          </>
                        ) : (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                              <div className="flex items-center">
                                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                <div>
                                  <span className="font-medium text-green-800">{appliedCoupon.code}</span>
                                  <p className="text-sm text-green-600">Saved Rs. {couponDiscount}</p>
                                </div>
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={handleRemoveCoupon}
                                className="text-red-500 hover:text-red-700 p-1"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </motion.button>
                            </div>
                            <p className="text-xs text-gray-500">
                              {appliedCoupon.description}
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>

                    {/* Help Card */}
                    <motion.div 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 ease-in-out p-6"
                    >
                      <h3 className="text-lg font-semibold mb-4 text-gray-800">Need Help?</h3>
                      <div className="space-y-3">
                        <motion.div 
                          whileHover={{ scale: 1.02 }}
                          className="flex items-center text-gray-600 hover:text-[#DB4444] transition-all duration-300 cursor-pointer group"
                        >
                          <a href="/support" className="flex items-center w-full">
                            <svg className="w-5 h-5 mr-2 text-[#DB4444] group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span>Chat with us</span>
                          </a>
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
                        <motion.a 
                          href="/faq"
                          whileHover={{ scale: 1.02 }}
                          className="flex items-center text-gray-600 hover:text-[#DB4444] transition-all duration-300 group"
                        >
                          <svg className="w-5 h-5 mr-2 text-[#DB4444] group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>View FAQs</span>
                        </motion.a>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </main>
          <Footer />
        </>
      )}
    </div>
  );
};

export default CartPage;
