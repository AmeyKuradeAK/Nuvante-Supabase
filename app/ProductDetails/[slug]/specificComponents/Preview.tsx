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
}

const Preview = () => {
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
    productImages: []
  });
  const [collapsible, setCollapsible] = useState<boolean[]>(
    Array(4).fill(false)
  );

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
      console.log("the slug is undefined");
      window.location.href = "https://google.com";
    } else {
      setHash(slug);
    }
  }, [hash, slug, showAlert]);

  useEffect(() => {
    // Update local cart state when GlobalCart changes
    setIsInCart(GlobalCart.includes(id));
  }, [GlobalCart, id]);

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

    if (!user.isSignedIn) {
      showAlert("Please sign in to access cart", "warning");
      setTimeout(() => {
        router.push("/sign-in");
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
    if (!user.isSignedIn) {
      showAlert("Please sign in to access wishlist", "warning");
      setTimeout(() => {
        router.push("/sign-in");
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
              <div className="flex gap-2 items-center">
                <h1 className="text-xl font-medium text-[#DB4444]">
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
              <h2 className="text-sm font-medium mb-3">Select Size</h2>
              <div className="grid grid-cols-4 gap-2">
                {["S", "M", "L", "XL"].map((size) => (
                  <button
                    key={size}
                    className={`border-2 py-2 text-center transition-colors ${
                      size === current
                        ? "bg-black text-white border-black"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => handleSwitch(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                This product has a larger fit than usual. Model is wearing L.
              </p>
            </div>

            {/* Add to Cart Buttons */}
            <div className="mt-6 space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 border-2 border-[#DB4444] text-[#DB4444] hover:bg-[#DB4444] hover:text-white transition-all duration-300 font-medium"
                onClick={handleAddToCart}
              >
                {isInCart ? "Remove from Cart" : "Add to Cart"}
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 bg-black text-white hover:bg-gray-800 transition-all duration-300 font-medium"
                onClick={() => showAlert("Coming Soon!", "info")}
              >
                Buy Now
              </motion.button>
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
        <motion.div
          className="w-fit mx-auto mt-20"
          animate={{
            rotate: 360,
            transition: {
              duration: 1.5,
              repeat: Infinity,
              ease: "linear"
            },
          }}
        >
          <Image src={logo} alt="Loading..." width={60} height={60} priority />
        </motion.div>
      )}
    </>
  );
};

export default Preview;
