"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import Image from "next/image";
import { useContext } from "react";
import { GlobalContext } from "@/context/Global";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import ProductCarousel from "@/components/ProductCarousel";
import { useAlert } from "@/context/AlertContext";
import { useRouter } from "next/navigation";
import ProductDetailsSkeleton from "@/components/ProductDetailsSkeleton";
import SizeChart from "@/components/SizeChart";

const return_icon = "/icon-return.png";
const delivery_icon = "/icon-delivery.png";
const product_icon = "/product.png";

const domain = process.env.DOMAIN;
const logo = "/logo.png";

interface ProductData {
  productName: string;
  productPrice: string;
  cancelledProductPrice: string;
  productInfo: string;
  description: string;
  materials: string;
  packaging: string;
  shipping: string;
  productImages: string[];
  soldOut?: boolean;
  soldOutSizes?: string[];
}

const Preview: React.FC = () => {
  const [hash, setHash] = useState<string | string[]>("");
  const { slug } = useParams();
  const [current, setCurrent] = useState("");
  const [productImages, setProductImages] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [loaded, setLoaded] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const id: any = hash || slug;
  const [currentProduct, setCurrentProduct] = useState<ProductData>({
    productName: "",
    productPrice: "",
    cancelledProductPrice: "",
    productInfo: "",
    description: "",
    materials: "",
    packaging: "",
    shipping: "",
    productImages: [],
    soldOut: false,
    soldOutSizes: [],
  });
  const [collapsible, setCollapsible] = useState<boolean[]>(
    Array(4).fill(false)
  );
  const [showSizeChart, setShowSizeChart] = useState(false);

  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error("GlobalContext is not provided.");
  }
  const user = useUser();
  const { GlobalWishlist, changeGlobalWishlist, GlobalCart, changeGlobalCart } = context;
  const { showAlert } = useAlert();
  const router = useRouter();

  useEffect(() => {
    const fetchImages = async () => {
      const id = hash || slug;
      try {
        const response = await axios
          .post(`/api/propagation/`, {
            id: id,
            every: false,
          })
          .then((data) => {
            const responseData = data.data as ProductData;
            const altered = responseData.productImages || [];
            altered.reverse();
            setProductImages(altered);
            setCurrentProduct(responseData);
          });

        setLoaded(true);
        productImages.reverse();
      } catch (error) {
        console.error("Error fetching product images:", error);
        showAlert("Error loading product images", "error");
      }
    };

    fetchImages();
    if (slug === undefined) {
      window.location.href = "/";
    } else {
      setHash(slug);
    }
  }, [hash, slug, showAlert]);

  useEffect(() => {
    // Only check cart state if user is signed in
    if (user.isSignedIn) {
    setIsInCart(GlobalCart.includes(id));
    }
  }, [GlobalCart, id, user.isSignedIn]);

  const handleSwitch = (size: any) => {
    setCurrent(size);
  };

  const handleQuantityChange = (delta: any) => {
    if (quantity + delta < 1) {
      return;
    }
    setQuantity((prevQuantity) => prevQuantity + delta);
  };

  const handleAddToCart = async (event: React.MouseEvent) => {
    event.stopPropagation();

    // Prevent interaction if product is sold out
    if (currentProduct.soldOut) {
      showAlert("This product is sold out", "warning");
      return;
    }

    // Check if selected size is sold out
    if (current && currentProduct.soldOutSizes?.includes(current)) {
      showAlert(`Size ${current} is currently sold out. Please select another size.`, "warning");
      return;
    }

    if (!user.isSignedIn) {
      showAlert("Please sign in to add items to cart", "warning");
      setTimeout(() => {
        router.push(`/sign-in?redirect_url=${encodeURIComponent(window.location.pathname)}`);
      }, 2000);
      return;
    }

    const id: any = hash || slug;
    try {
      const isPresent = GlobalCart.includes(id);
      
      // Make the API call first
      const response = await axios.post("/api/cart", {
          identifier: id,
          append: !isPresent,
      });

      // Check if response is successful
      if (response.status === 200) {
        // Update both states after successful API call
        changeGlobalCart(id);
        setIsInCart(!isPresent);
        showAlert(
          isPresent ? "Item removed from cart" : "Item added to cart",
          "success"
        );
      } else {
        showAlert("Error updating cart", "error");
      }
    } catch (error) {
      console.error("Error updating cart:", error);
      showAlert("Error updating cart", "error");
    }
  };

  const handleCollapsibleState = (index: any) => {
    setCollapsible((prevCollapsible) => {
      return prevCollapsible
        .slice(0, index - 1)
        .concat(prevCollapsible[index - 1] === true ? false : true)
        .concat(prevCollapsible.slice(index));
    });
  };

  const handleWishlistPresence = async (event: React.MouseEvent) => {
    event.stopPropagation();
    
    // Prevent interaction if sold out
    if (currentProduct.soldOut) {
      showAlert("This product is sold out", "warning");
      return;
    }
    
    if (!user.isSignedIn) {
      showAlert("Please sign in to add items to wishlist", "warning");
      setTimeout(() => {
        router.push(`/sign-in?redirect_url=${encodeURIComponent(window.location.pathname)}`);
      }, 2000);
      return;
    }
    try {
      const id: any = hash || slug;
      const isPresent = GlobalWishlist.includes(id);
      await axios
        .post(`/api/wishlist`, {
          identifier: id,
          append: !isPresent,
        })
        .then((response: any) => {
          if (response.data === parseInt("200")) {
            const updatedWishlist = isPresent
              ? GlobalWishlist.filter((item) => item !== id)
              : [...GlobalWishlist, id];

            changeGlobalWishlist(updatedWishlist);
            setLoaded(true);
            showAlert(
              isPresent ? "Item removed from wishlist" : "Item added to wishlist",
              "success"
            );
          } else if (response.data === parseInt("404")) {
            showAlert("Error updating wishlist", "error");
          }
        });
    } catch (error) {
      console.error("Error updating wishlist:", error);
      showAlert("Error updating wishlist", "error");
    }
  };

  const handleBuyNow = async () => {
    // Prevent interaction if sold out
    if (currentProduct.soldOut) {
      showAlert("This product is sold out", "warning");
      return;
    }
    
    if (!user.isSignedIn) {
      showAlert("Please sign in to proceed with checkout", "warning");
      setTimeout(() => {
        router.push(`/sign-in?redirect_url=${encodeURIComponent(window.location.pathname)}`);
      }, 2000);
      return;
    }

    if (!current) {
      showAlert("Please select a size", "error");
      return;
    }

    // Check if selected size is sold out
    if (currentProduct.soldOutSizes?.includes(current)) {
      showAlert(`Size ${current} is currently sold out. Please select another size.`, "warning");
      return;
    }

    // Navigate directly to checkout with the product details
    router.push(`/CheckOut?product=${id}&size=${current}&quantity=${quantity}`);
  };

  return (
    <>
      {loaded && (
        <div className="flex flex-col lg:flex-row gap-10 w-full max-w-full overflow-x-hidden -mx-4 lg:mx-0">
          {/* Product Images */}
          <div className="flex-1 lg:w-[60%]">
            <ProductCarousel images={productImages} />
          </div>

          {/* Product Details */}
          <div className="flex flex-col gap-4 lg:w-[40%] px-4 lg:px-0">
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-medium">{currentProduct.productName}</h1>
              {currentProduct.soldOut && (
                <div className="bg-red-100 border border-red-300 text-red-800 px-3 py-2 rounded-md text-sm font-medium">
                  ⚠️ This product is currently sold out
                </div>
              )}
              <div className="flex gap-2 items-center">
                <h1 className={`text-xl font-medium ${currentProduct.soldOut ? 'text-gray-400' : 'text-[#DB4444]'}`}>
                  Rs. {currentProduct.productPrice}
                </h1>
                <h1 className="text-lg line-through text-gray-500">
                  Rs. {currentProduct.cancelledProductPrice}
                </h1>
              </div>
              <p className="text-sm text-gray-600 mt-2">{currentProduct.productInfo}</p>
            </div>

            {/* Size Selection */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-medium">Select Size</h2>
                <motion.button
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowSizeChart(true)}
                  className="group flex items-center gap-1.5 text-xs text-[#DB4444] hover:text-[#c13a3a] transition-all duration-300 font-medium border border-[#DB4444] hover:border-[#c13a3a] px-3 py-1.5 rounded-full hover:bg-[#DB4444]/5 hover:shadow-md"
                >
                  <svg className="w-3.5 h-3.5 transition-transform duration-300 group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="transition-transform duration-300 group-hover:translate-x-0.5">Size Chart</span>
                </motion.button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {["S", "M", "L", "XL"].map((size) => {
                  const isSizeSoldOut = currentProduct.soldOutSizes?.includes(size);
                  const isDisabled = currentProduct.soldOut || isSizeSoldOut;
                  
                  return (
                    <button
                      key={size}
                      disabled={isDisabled}
                      className={`border-2 py-2 text-center transition-colors relative ${
                        isDisabled
                          ? "border-gray-200 text-gray-400 cursor-not-allowed bg-gray-100"
                          : size === current
                            ? "bg-black text-white border-black"
                            : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => !isDisabled && handleSwitch(size)}
                    >
                      {size}
                      {isSizeSoldOut && !currentProduct.soldOut && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded-full">
                          ✕
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                This product has a larger fit than usual. Model is wearing L.
              </p>
              {currentProduct.soldOutSizes && currentProduct.soldOutSizes.length > 0 && !currentProduct.soldOut && (
                <p className="text-xs text-red-500 mt-2">
                  Sizes {currentProduct.soldOutSizes.join(", ")} are currently sold out
                </p>
              )}
            </div>

            {/* Add to Cart Buttons */}
            <div className="mt-6 space-y-4">
              {currentProduct.soldOut ? (
                <div className="space-y-4">
                  <button
                    disabled
                    className="w-full bg-gray-400 text-gray-600 font-medium py-2.5 px-4 rounded-md cursor-not-allowed"
                  >
                    Sold Out
                  </button>
                  <motion.button 
                    disabled
                    className="w-full py-3 bg-gray-400 text-gray-600 cursor-not-allowed font-medium rounded-md"
                  >
                    Sold Out
                  </motion.button>
                </div>
              ) : isInCart ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center border rounded-md">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      className="w-16 text-center border-x focus:outline-none focus:ring-2 focus:ring-[#DB4444] focus:border-transparent"
                      min={1}
                    />
                    <button
                      onClick={() => handleQuantityChange(1)}
                      className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 bg-[#DB4444] text-white font-medium py-2.5 px-4 rounded-md hover:bg-black transition-colors duration-200"
                  >
                    Remove from Cart
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={handleAddToCart}
                    className="w-full bg-[#DB4444] text-white font-medium py-2.5 px-4 rounded-md hover:bg-black transition-colors duration-200"
                  >
                    Add to Cart
                  </button>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 bg-black text-white hover:bg-gray-800 transition-all duration-300 font-medium"
                    onClick={handleBuyNow}
                  >
                    Buy Now
                  </motion.button>
                </>
              )}
            </div>

            {/* Product Information */}
            <div className="mt-8 space-y-4">
              <motion.div 
                className="border-b border-gray-200 pb-4"
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => handleCollapsibleState(1)}
                >
                  <h3 className="font-medium">Description</h3>
                  <motion.span
                    animate={{ rotate: collapsible[0] ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {collapsible[0] ? "−" : "+"}
                  </motion.span>
                </div>
                <motion.div
                  initial={false}
                  animate={{ height: collapsible[0] ? "auto" : 0, opacity: collapsible[0] ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <p className="mt-2 text-sm text-gray-600">
                  {currentProduct.description}
                  </p>
                </motion.div>
              </motion.div>

              <motion.div 
                className="border-b border-gray-200 pb-4"
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => handleCollapsibleState(2)}
                >
                  <h3 className="font-medium">Materials</h3>
                  <motion.span
                    animate={{ rotate: collapsible[1] ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {collapsible[1] ? "−" : "+"}
                  </motion.span>
                </div>
                <motion.div
                  initial={false}
                  animate={{ height: collapsible[1] ? "auto" : 0, opacity: collapsible[1] ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <p className="mt-2 text-sm text-gray-600">
                  {currentProduct.materials}
                  </p>
                </motion.div>
              </motion.div>

              <motion.div 
                className="border-b border-gray-200 pb-4"
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => handleCollapsibleState(3)}
                >
                  <h3 className="font-medium">Packaging</h3>
                  <motion.span
                    animate={{ rotate: collapsible[2] ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {collapsible[2] ? "−" : "+"}
                  </motion.span>
                </div>
                <motion.div
                  initial={false}
                  animate={{ height: collapsible[2] ? "auto" : 0, opacity: collapsible[2] ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <p className="mt-2 text-sm text-gray-600">
                  {currentProduct.packaging}
                  </p>
                </motion.div>
              </motion.div>

              <motion.div 
                className="border-b border-gray-200 pb-4"
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => handleCollapsibleState(4)}
                >
                  <h3 className="font-medium">Shipping & Returns</h3>
                  <motion.span
                    animate={{ rotate: collapsible[3] ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {collapsible[3] ? "−" : "+"}
                  </motion.span>
                </div>
                <motion.div
                  initial={false}
                  animate={{ height: collapsible[3] ? "auto" : 0, opacity: collapsible[3] ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <p className="mt-2 text-sm text-gray-600">
                  {currentProduct.shipping}
                  </p>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      )}
      {!loaded && (
        <ProductDetailsSkeleton />
      )}
      
      {/* Size Chart Modal */}
      <SizeChart
        isOpen={showSizeChart}
        onClose={() => setShowSizeChart(false)}
      />
    </>
  );
};

export default Preview;
