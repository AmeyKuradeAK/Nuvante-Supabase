# Nuvante 

A website curated for a clothing brand based in India. The tech stack is quite standard, we have used tailwindCSS, Next.js (With Typescript), Framer Motion, MongoDB for database operations, netlify for a live environment, Clerk for authentication based backend & Redux.

# Preview code
```js
// Preview.tsx
"use client";
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import Image from "next/image"; // Keep for preloader, but main carousel uses <img> for simplicity with dynamic src
import { GlobalContext } from "@/context/Global";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import "keen-slider/keen-slider.min.css";
import { useKeenSlider } from "keen-slider/react";

const logo = "/logo.png";

const Preview = () => {
  const [hash, setHash] = useState<string | string[]>("");
  const { slug } = useParams();
  const [current, setCurrent] = useState("");
  const [productImages, setProductImages] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1); // This state is not used in the provided JSX, but kept as is.
  const [loaded, setLoaded] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<any>({});
  const [collapsible, setCollapsible] = useState<boolean[]>(
    Array(4).fill(false)
  );
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const id: any = hash || slug;

  const context = useContext(GlobalContext);
  if (!context) throw new Error("GlobalContext is not provided.");
  const { GlobalWishlist, changeGlobalWishlist, GlobalCart, changeGlobalCart } =
    context;

  const user = useUser();

  const fetchProductData = async () => {
    if (!id) return; // Ensure id is present before fetching
    try {
      const { data } = await axios.post(`/api/propagation/`, {
        id,
        every: false,
      });
      const images = data.productImages || [];
      setProductImages(images);
      setCurrentProduct(data);
      setLoaded(true);
    } catch (error) {
      console.error("Error fetching product data:", error);
      setLoaded(true); // Set loaded to true even on error to stop preloader
    }
  };

  useEffect(() => {
    if (!slug) {
      console.warn("Slug is not available.");
      // Potentially redirect to a safer page or show an error.
      return;
    }
    setHash(slug);
  }, [slug]);

  useEffect(() => {
    // Fetch data when hash (derived from slug) is set
    if (hash) {
      fetchProductData();
    }
  }, [hash]); // fetchProductData dependency on `id` covers `hash` changes internally.

  const handleSwitch = (size: string) => setCurrent(size);

  const updateCart = async (productId: string) => {
    const isPresent = GlobalCart.includes(productId);
    try {
      const res = await axios.post(`/api/cart`, {
        identifier: productId,
        append: !isPresent,
      });
      if (res.data === 200 || res.status === 200) { // Check res.status too
        const updatedCart = isPresent
          ? GlobalCart.filter((item) => item !== productId)
          : [...GlobalCart, productId];
        changeGlobalCart(updatedCart);
        alert("Cart updated successfully!");
      }
    } catch (err) {
      console.error("Cart error:", err);
      alert("Failed to update cart.");
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user.isSignedIn) {
      alert("Please sign in first.");
      window.location.href = "/sign-in"; // Consider using Next.js router.push for internal navigation
      return;
    }
    if (hash) {
      updateCart(hash as string);
    } else {
      alert("Product ID is missing.");
    }
  };

  const updateWishlist = async (productId: string) => {
    const isPresent = GlobalWishlist.includes(productId);
    try {
      const res = await axios.post(`/api/wishlist`, {
        identifier: productId,
        append: !isPresent,
      });
      if (res.data === 200 || res.status === 200) { // Check res.status too
        const updatedWishlist = isPresent
          ? GlobalWishlist.filter((item) => item !== productId)
          : [...GlobalWishlist, productId];
        changeGlobalWishlist(updatedWishlist);
        alert("Wishlist updated successfully!");
      }
    } catch (err) {
      console.error("Wishlist error:", err);
      alert("Failed to update wishlist.");
    }
  };

  const handleWishlistPresence = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user.isSignedIn) {
      alert("Please sign in first.");
      window.location.href = "/sign-in"; // Consider using Next.js router.push
      return;
    }
    if (hash) {
      updateWishlist(hash as string);
    } else {
      alert("Product ID is missing.");
    }
  };

  const toggleCollapsible = (index: number) => {
    setCollapsible((prev) =>
      prev.map((val, i) => (i === index ? !val : val))
    );
  };

  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    loop: true,
    slideChanged: (s) => setCurrentSlide(s.track.details.rel),
    slides: { perView: 1, spacing: 0 }, // Spacing 0 for main slider, thumbnails will have their own
    dragSpeed: 0.8,
    vertical: isLargeScreen,
    renderMode: "performance",
  });

  useEffect(() => {
    const updateScreenSize = () => {
      // Ensures mobile layout (horizontal thumbnails) for 1024px and below.
      // Desktop layout (vertical thumbnails) for screens wider than 1024px.
      setIsLargeScreen(window.innerWidth > 1024); 
    };
    updateScreenSize();
    window.addEventListener("resize", updateScreenSize);
    return () => window.removeEventListener("resize", updateScreenSize);
  }, []);

  useEffect(() => {
    if (isHovered || !instanceRef.current) return;
    const interval = setInterval(() => {
      instanceRef.current?.next();
    }, 7000);
    return () => clearInterval(interval);
  }, [isHovered, instanceRef]); // instanceRef added to dependency array

  return loaded ? (
    <div className="preview_container flex justify-center items-start lg:flex-row flex-col-reverse gap-10 w-full px-4 xl:px-20 2xl:px-48 max-w-screen-2xl mx-auto my-8 lg:my-12">
      {/* Left Collapsibles */}
      <div className="flex flex-col gap-4 justify-center lg:p-6 self-start lg:w-[100%] w-full max-w-[500px]">
        <div className="flex flex-col border-2 border-black p-4 gap-6">
          {["DESCRIPTION", "MATERIALS", "PACKAGING", "SHIPPING & RETURNS"].map(
            (section, i) => (
              <div key={i} className="border-b-2 border-b-gray-200 text-sm">
                <div
                  className="flex justify-between cursor-pointer text-base sm:text-lg py-2"
                  onClick={() => toggleCollapsible(i)}
                >
                  <span>{section}</span>
                  <span className={`transform transition-transform duration-300 ${collapsible[i] ? 'rotate-45' : 'rotate-0'}`}>[+]</span>
                </div>
                <div
                  className={`transition-all duration-500 ease-in-out ${
                    collapsible[i]
                      ? "max-h-[150px] py-2 overflow-y-auto" // Increased max-h
                      : "max-h-0 overflow-hidden"
                  }`}
                >
                  {/* Ensure currentProduct keys match exactly or add fallback */}
                  {currentProduct[
                    section.toLowerCase().replace(/\s+/g, "").replace("&", "and") // handle '&' if needed
                  ] || `Content for ${section} not available.`}
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Middle Carousel and Thumbnails */}
      <div className="relative flex flex-col items-center lg:items-start lg:flex-row gap-0 lg:gap-5 lg:w-[calc(40%+100px)] w-full max-w-[700px] lg:max-w-none self-center">
        {/* Desktop Vertical Thumbnails (Order 1 for flex layout on large screens) */}
        {isLargeScreen && productImages.length > 0 && (
          <div className="lg:order-1 flex flex-col items-center justify-center gap-2 p-1 w-24 h-full sticky top-20" style={{ maxHeight: 'calc(min(800px, 80vh))' }}> {/* Adjust maxHeight as needed */}
            <button
              onClick={() => instanceRef.current?.prev()}
              className="text-2xl font-bold text-black hover:text-gray-700 transition-colors my-1 disabled:opacity-50"
              disabled={!instanceRef.current?.track.details.slides.length}
            >
              &#8593;
            </button>
            <div className="flex-grow flex flex-col gap-2.5 overflow-y-auto w-full items-center py-1 scrollbar-hide"> {/* scrollbar-hide for cleaner look, or use specific scrollbar styling */}
              {productImages.map((img, idx) => (
                <img
                  key={`thumb-v-${idx}`}
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  onClick={() => instanceRef.current?.moveToIdx(idx)}
                  className={`w-16 h-[70px] object-cover cursor-pointer rounded-md transition-all duration-200 ease-in-out flex-shrink-0 hover:opacity-100 ${
                    currentSlide === idx
                      ? "border-2 border-black ring-1 ring-black ring-offset-1 scale-105 opacity-100"
                      : "border-2 border-gray-300 opacity-60"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={() => instanceRef.current?.next()}
              className="text-2xl font-bold text-black hover:text-gray-700 transition-colors my-1 disabled:opacity-50"
              disabled={!instanceRef.current?.track.details.slides.length}
            >
              &#8595;
            </button>
          </div>
        )}

        {/* Main Carousel (Order 2 for flex layout on large screens) */}
        <div
          className={`lg:order-2 w-full lg:w-[calc(100%-100px)] ${isLargeScreen ? 'ml-0' : 'ml-0' }`} // ensure it takes remaining space or specific width
        >
          <div
            ref={sliderRef}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="keen-slider w-full h-[60vh] sm:h-[70vh] lg:h-[calc(min(800px,80vh))] aspect-[3/4] lg:aspect-[4/5] 2xl:aspect-[5/6] rounded-md overflow-hidden bg-gray-100" // Added bg-gray-100 for empty state
          >
            {productImages.length > 0 ? (
                productImages.map((img, idx) => (
                <div
                    key={`slide-${idx}`}
                    className="keen-slider__slide flex items-center justify-center bg-white"
                >
                    <img
                    src={img}
                    alt={`Product image ${idx + 1} for ${currentProduct.productName || 'product'}`}
                    className="w-full h-full object-cover"
                    />
                </div>
                ))
            ) : (
                <div className="keen-slider__slide flex items-center justify-center bg-gray-200 h-full">
                    <p className="text-gray-500">No images available</p>
                </div>
            )}
          </div>

          {/* Mobile Horizontal Thumbnails (Below Carousel) */}
          {!isLargeScreen && productImages.length > 0 && (
            <div className="flex items-center justify-center gap-2 mt-4 w-full px-2">
              <button
                onClick={() => instanceRef.current?.prev()}
                className="text-2xl font-bold p-2 text-black hover:text-gray-700 transition-colors disabled:opacity-50"
                disabled={!instanceRef.current?.track.details.slides.length}
              >
                &#8592;
              </button>
              <div className="flex gap-2.5 overflow-x-auto py-1 scrollbar-hide"> {/* scrollbar-hide for cleaner look */}
                {productImages.map((img, idx) => (
                  <img
                    key={`thumb-h-${idx}`}
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    onClick={() => instanceRef.current?.moveToIdx(idx)}
                    className={`w-14 h-14 sm:w-16 sm:h-16 object-cover cursor-pointer rounded-md flex-shrink-0 transition-all duration-200 ease-in-out hover:opacity-100 ${
                      currentSlide === idx
                        ? "border-2 border-black ring-1 ring-black ring-offset-1 scale-105 opacity-100"
                        : "border-2 border-gray-300 opacity-60"
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={() => instanceRef.current?.next()}
                className="text-2xl font-bold p-2 text-black hover:text-gray-700 transition-colors disabled:opacity-50"
                disabled={!instanceRef.current?.track.details.slides.length}
              >
                &#8594;
              </button>
            </div>
          )}
        </div>


        {/* Mobile Info (This was part of the middle column, now appears below carousel on mobile) */}
        {/* This div is shown only on small screens due to lg:hidden */}
        <div className="lg:hidden w-full mt-6 border-2 border-black flex flex-col gap-5 p-6">
          <h1 className="text-3xl sm:text-4xl font-semibold">
            {currentProduct.productName}
          </h1>
          <div className="flex gap-2 text-xl sm:text-2xl">
            <span className="line-through text-gray-500">
              Rs. {currentProduct.cancelledProductPrice}
            </span>
            <span className="font-medium">
              Rs. {currentProduct.productPrice}
            </span>
          </div>
          <p className="text-lg sm:text-xl">{currentProduct.productInfo}</p>
          <p className="text-sm sm:text-base opacity-70 border-b pb-2">
            SHIPPING, EXCHANGES AND RETURNS
          </p>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {["S", "M", "L", "XL"].map((size) => (
              <div
                key={size}
                className={`border-2 py-3 sm:py-4 text-center cursor-pointer text-xl sm:text-2xl ${
                  size === current
                    ? "bg-black text-white"
                    : "text-black hover:bg-gray-100"
                }`}
                onClick={() => handleSwitch(size)}
              >
                {size}
              </div>
            ))}
          </div>
          <p className="text-sm sm:text-base text-gray-600 mt-3">
            This product has a larger fit than usual. Model is wearing L.
          </p>
          <button
            className="mt-3 border-2 border-black py-4 sm:py-5 text-xl hover:bg-black hover:text-white transition-colors"
            onClick={handleAddToCart}
          >
            ADD
          </button>
          <button className="bg-black text-white py-4 sm:py-5 text-xl hover:bg-gray-800 transition-colors">
            BUY IT NOW
          </button>
        </div>
      </div>


      {/* Right Info (Desktop) */}
      <div className="hidden lg:flex flex-col border-2 border-black gap-4 p-6 lg:w-[30%] max-w-[500px] self-start sticky top-20"> {/* Added sticky top-20 */}
        <h1 className="text-2xl">{currentProduct.productName}</h1>
        <div className="flex gap-3">
          <span className="line-through text-sm">
            Rs. {currentProduct.cancelledProductPrice}
          </span>
          <span className="text-sm">Rs. {currentProduct.productPrice}</span>
        </div>
        <p className="text-sm">{currentProduct.productInfo}</p>
        <p className="text-[11px] opacity-70 border-b pb-3">
          SHIPPING, EXCHANGES AND RETURNS
        </p>
        <div className="grid grid-cols-2 gap-3 mt-4">
          {["S", "M", "L", "XL"].map((size) => (
            <div
              key={size}
              className={`border-2 py-3 text-center cursor-pointer ${
                size === current
                  ? "bg-black text-white"
                  : "text-black hover:bg-gray-100"
              }`}
              onClick={() => handleSwitch(size)}
            >
              {size}
            </div>
          ))}
        </div>
        <p className="text-[10px] text-gray-600 mt-3">
          This product has a larger fit than usual. Model is wearing L.
        </p>
        <div className="flex-grow"></div> {/* Pushes buttons to bottom */}
        <button
          className="mt-3 border-2 border-black py-3 hover:bg-black hover:text-white transition-colors"
          onClick={handleAddToCart}
        >
          ADD
        </button>
        <button className="bg-black text-white py-3 hover:bg-gray-800 transition-colors">
          BUY IT NOW
        </button>
      </div>
    </div>
  ) : (
    <div className="flex justify-center items-center h-screen">
      <motion.div
        className="w-fit mx-auto"
        animate={{ rotate: 360 }}
        transition={{
          duration: 1.5,
          ease: "linear", // Using linear for smoother continuous rotation
          repeat: Infinity,
        }}
      >
        <Image src={logo} alt="Loading preview..." width={60} height={60} priority />
      </motion.div>
    </div>
  );
};

export default Preview;
```