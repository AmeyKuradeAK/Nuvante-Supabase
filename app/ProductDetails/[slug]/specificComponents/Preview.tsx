"use client";
import React, { useState, useEffect, useContext, useCallback } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import Image from "next/image";
import { GlobalContext } from "@/context/Global";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";

const logo = "/logo.png";

const Preview = () => {
  const { slug } = useParams();
  const [currentProduct, setCurrentProduct] = useState<any>(null);
  const [productImages, setProductImages] = useState<string[]>([]);
  const [collapsible, setCollapsible] = useState<boolean[]>([
    false,
    false,
    false,
    false,
  ]);
  const [isLargeScreen, setIsLargeScreen] = useState<boolean>(false);
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [currentSize, setCurrentSize] = useState<string>("");
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [loaded, setLoaded] = useState<boolean>(false);

  const { isSignedIn } = useUser();

  const context = useContext(GlobalContext);
  if (!context) throw new Error("GlobalContext is not provided.");
  const { GlobalWishlist, changeGlobalWishlist, GlobalCart, changeGlobalCart } =
    context;

  const id: string | undefined =
    typeof slug === "string" ? slug : Array.isArray(slug) ? slug[0] : undefined;

  const fetchProductData = useCallback(async () => {
    if (!id) return;
    try {
      const { data } = await axios.post(`/api/propagation/`, {
        id,
        every: false,
      });
      setProductImages(data.productImages || []);
      setCurrentProduct(data);
      setLoaded(true);
    } catch (error) {
      console.error("Error fetching product data:", error);
    }
  }, [id]);

  useEffect(() => {
    if (!id) {
      window.location.href = "https://google.com";
      return;
    }
    fetchProductData();
  }, [id, fetchProductData]);

  const updateCart = async () => {
    if (!id) return;
    const isPresent = GlobalCart.includes(id);
    try {
      const res = await axios.post(`/api/cart`, {
        identifier: id,
        append: !isPresent,
      });
      if (res.data === 200) {
        // Update the global cart context with the correct signature
        await changeGlobalCart(id, !isPresent);
        alert("Cart updated successfully!");
      }
    } catch (err) {
      console.error("Cart error:", err);
    }
  };

  const updateWishlist = async () => {
    if (!id) return;
    const isPresent = GlobalWishlist.includes(id);
    try {
      const res = await axios.post(`/api/wishlist`, {
        identifier: id,
        append: !isPresent,
      });
      if (res.data === 200) {
        const updated = isPresent
          ? GlobalWishlist.filter((item) => item !== id)
          : [...GlobalWishlist, id];
        changeGlobalWishlist(updated);
        setLoaded(true);
      }
    } catch (err) {
      console.error("Wishlist error:", err);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isSignedIn) {
      alert("Please sign in first.");
      window.location.href = "/sign-in";
      return;
    }
    updateCart();
  };

  const handleWishlistPresence = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isSignedIn) {
      alert("Please sign in first.");
      window.location.href = "/sign-in";
      return;
    }
    updateWishlist();
  };

  const toggleCollapsible = (index: number) => {
    setCollapsible((prev) =>
      prev.map((open, i) => (i === index ? !open : open))
    );
  };

  const handleSwitch = (size: string) => {
    setCurrentSize(size);
  };

  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    loop: true,
    slideChanged: (s) => setCurrentSlide(s.track.details.rel),
    slides: { perView: 1, spacing: 15 },
    dragSpeed: 0.8,
    vertical: isLargeScreen,
    renderMode: "performance",
  });

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };
    handleResize();

    let debounce: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(debounce);
      debounce = setTimeout(handleResize, 100);
    };

    window.addEventListener("resize", debouncedResize);
    return () => window.removeEventListener("resize", debouncedResize);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const slider = instanceRef.current;
      if (!isHovered && slider?.track?.details) {
        slider.next();
      }
    }, 7000);

    return () => clearInterval(interval);
  }, [isHovered]);

  if (!loaded || !currentProduct) {
    return (
      <motion.div
        className="w-fit mx-auto mt-20"
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity }}
      >
        <Image src={logo} alt="preloader" width={60} height={60} />
      </motion.div>
    );
  }

  return (
    <div className="preview_container flex justify-center items-center lg:flex-row flex-col-reverse gap-10 w-full xl:px-16 2xl:px-20 max-w-[2100px] mx-auto">
      {/* Left Collapsibles */}
      <div className="flex flex-col gap-4 px-4 lg:p-6 self-center xl:mr-12 2xl:mr-20 lg:w-[30%] w-full max-w-[500px] xl:max-w-[420px] 2xl:max-w-[480px]">
        <div className="flex flex-col border-2 border-black p-4 gap-6">
          {["DESCRIPTION", "MATERIALS", "PACKAGING", "SHIPPING & RETURNS"].map(
            (section, i) => (
              <div key={i} className="border-b-2 border-b-gray-200 text-sm">
                <div
                  className="flex justify-between cursor-pointer text-base sm:text-lg"
                  onClick={() => toggleCollapsible(i)}
                >
                  <span>{section}</span>
                  <span>[+]</span>
                </div>
                <div
                  className={`transition-all duration-500 ${
                    collapsible[i]
                      ? "h-[100px] py-2 overflow-y-auto"
                      : "h-0 overflow-hidden"
                  }`}
                >
                  {currentProduct[section.toLowerCase().replace(/\s+/g, "")]}
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Middle Carousel */}
      <div className="relative flex flex-col gap-6 lg:w-[42%] md:w-[94%] w-full max-w-[740px] self-center xl:max-w-[640px] 2xl:max-w-[720px]">
        {/* Vertical Thumbnails */}
        <div className="absolute hidden lg:hidden xl:flex flex-col gap-3 left-[-90px] top-1/2 -translate-y-1/2 overflow-hidden max-h-[600px] scrollbar-thin">
          {productImages.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`thumb-${idx}`}
              onClick={() => instanceRef.current?.moveToIdx(idx)}
              className={`w-16 h-20 object-cover lg:rounded-md cursor-pointer border-2 transition-all ${
                currentSlide === idx
                  ? "border-black scale-105"
                  : "border-gray-300"
              }`}
            />
          ))}
        </div>
        <div className="w-full md:w-[90%] mx-auto">
          <div
            ref={sliderRef}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="keen-slider w-full h-[75vh] md:w-[200px] md:h-[550px] lg:h-[600px] xl:h-[800px] 2xl:h-[900px] aspect-[4/5] lg:rounded-md overflow-hidden mx-auto"
          >
            {productImages.map((img, idx) => (
              <div
                key={idx}
                className="keen-slider__slide flex items-center justify-center bg-white"
              >
                <img
                  src={img}
                  alt={`product-${idx}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Horizontal Thumbnails */}
        <div className="flex xl:hidden gap-3 justify-center overflow-x-auto py-2">
          {productImages.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`thumb-mobile-${idx}`}
              onClick={() => instanceRef.current?.moveToIdx(idx)}
              className={`w-16 h-20 object-cover cursor-pointer flex-shrink-0 border-2 transition-all ${
                currentSlide === idx
                  ? "border-black scale-105"
                  : "border-gray-300"
              }`}
            />
          ))}
        </div>

        {/* Mobile Info */}
        <div className="lg:hidden border-2 border-black w-[94%] flex ml-3 flex-col gap-2 p-6">
          <h1 className="text-2xl sm:text-3xl font-semibold xl:text-4xl 2xl:text-5xl">
            {currentProduct.productName}
          </h1>
          <div className="flex gap-2 text-lg sm:text-xl xl:text-2xl 2xl:text-3xl">
            <span className="line-through text-gray-500">
              Rs. {currentProduct.cancelledProductPrice}
            </span>
            <span className="font-medium">
              Rs. {currentProduct.productPrice}
            </span>
          </div>
          <p className="text-base sm:text-lg xl:text-xl 2xl:text-2xl">
            {currentProduct.productInfo}
          </p>
          <p className="text-sm sm:text-base opacity-70 border-b pb-2">
            SHIPPING, EXCHANGES AND RETURNS
          </p>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {["S", "M", "L", "XL"].map((size) => (
              <div
                key={size}
                className={`border-2 py-3 sm:py-4 text-center cursor-pointer text-lg sm:text-xl xl:text-2xl 2xl:text-3xl ${
                  size === currentSize ? "bg-black text-white" : "text-black"
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
            className="mt-3 border-2 border-black py-4 sm:py-5 text-lg sm:text-xl xl:text-2xl 2xl:text-3xl"
            onClick={handleAddToCart}
          >
            ADD
          </button>
          <button className="bg-black text-white py-4 sm:py-5 text-lg sm:text-xl xl:text-2xl 2xl:text-3xl">
            BUY IT NOW
          </button>
        </div>
      </div>

      {/* Right Info */}
      <div className="hidden lg:flex flex-col border-2 border-black gap-4 p-6 w-[30%] max-w-[500px] xl:max-w-[420px] 2xl:max-w-[480px] self-center">
        <h1 className="text-2xl lg:text-xl">{currentProduct.productName}</h1>
        <div className="flex gap-3">
          <span className="line-through text-sm lg:text-xs">
            Rs. {currentProduct.cancelledProductPrice}
          </span>
          <span className="text-sm lg:text-xs">
            Rs. {currentProduct.productPrice}
          </span>
        </div>
        <p className="text-sm lg:text-xs">{currentProduct.productInfo}</p>
        <p className="text-[11px] opacity-70 border-b pb-3 lg:text-[9px] lg:pb-[0.4rem]">
          SHIPPING, EXCHANGES AND RETURNS
        </p>
        <div className="grid grid-cols-2 gap-3 mt-4 lg:gap-2 lg:mt-2">
          {["S", "M", "L", "XL"].map((size) => (
            <div
              key={size}
              className={`border-2 py-3 text-center cursor-pointer lg:py-1.5 ${
                size === currentSize ? "bg-black text-white" : "text-black"
              }`}
              onClick={() => handleSwitch(size)}
            >
              {size}
            </div>
          ))}
        </div>
        <p className="text-[10px] text-gray-600 mt-3 lg:text-[8px] lg:mt-1.5">
          This product has a larger fit than usual. Model is wearing L.
        </p>
        <div className="flex-grow"></div>
        <button
          className="mt-3 lg:mt-1.5 border-2 border-black py-2 lg:py-1.5 lg:text-sm"
          onClick={handleAddToCart}
        >
          ADD
        </button>
        <button className="bg-black text-white py-2 lg:py-1.5 lg:text-sm">
          BUY IT NOW
        </button>
      </div>
    </div>
  );
};

export default Preview;
