"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import Image from "next/image";
import { useContext } from "react";
import { GlobalContext } from "@/context/Global";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";

const return_icon = "/icon-return.png";
const delivery_icon = "/icon-delivery.png";
const product_icon = "/product.png";

const domain = process.env.DOMAIN;
const logo = "/logo.png";

const Preview = () => {
  const [hash, setHash] = useState<string | string[]>("");
  const { slug } = useParams(); // Destructure slug directly
  const [current, setCurrent] = useState("");
  const [productImages, setProductImages] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [loaded, setLoaded] = useState(false);
  const id: any = hash || slug;
  const [currentProduct, setCurrentProduct] = useState({});
  const [collapsible, setCollapsible] = useState<boolean[]>(
    Array(4).fill(false)
  );

  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error("GlobalContext is not provided.");
  }
  const user = useUser();
  const { GlobalWishlist, changeGlobalWishlist, GlobalCart, changeGlobalCart } =
    context;

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
            var altered = data.data.productImages || [];
            altered.reverse();
            setProductImages(altered);
            setCurrentProduct(data.data);
            console.log("current product: \n", currentProduct);
          });

        setLoaded(true);
        productImages.reverse();
      } catch (error) {
        console.error("Error fetching product images:", error);
      }
    };

    fetchImages();
    if (slug === undefined) {
      console.log("the slug is undefined");
      window.location.href = "https://google.com";
    } else {
      setHash(slug);
    }
  }, [hash, slug]);

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
      alert("You are not signed in, please sign in first to access cart!");
      alert("Redirecting...");
      window.location.href = "/sign-in";
      return;
    }
    const id: any = hash || slug;
    try {
      const isPresent = GlobalCart.includes(id);
      await axios
        .post(`/api/cart`, {
          identifier: id,
          append: !isPresent,
        })
        .then((response: any) => {
          if (response.data === parseInt("200")) {
            const updatedCart = isPresent
              ? GlobalCart.filter((item) => item !== id)
              : [...GlobalCart, id];

            changeGlobalCart(updatedCart);
            alert("Cart updated successfully!");
          } else if (response.data === parseInt("404")) {
            alert(
              "there was an error updating the cart! Try refreshing the page!"
            );
          }
        });
    } catch (error) {
      console.error("Error updating cart:", error);
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
    console.log(user);
    if (!user.isSignedIn) {
      alert("You are not signed in, please sign in first to access wishlist!");
      alert("Redirecting...");
      window.location.href = "/sign-in";
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
          } else if (response.data === parseInt("404")) {
            alert(
              "there was an error updating the wishlist! Try refreshing the page!"
            );
          }
        });
    } catch (error) {
      console.error("Error updating wishlist:", error);
      alert(
        "There was an error updating the wishlist! Try refreshing the page."
      );
    }
  };

  return (
    <>
      {loaded && (
        <div className=" flex preview_container justify-between lg:flex-row flex-col-reverse gap-10 w-[100%]">
          <div className="flex flex-col gap-4 lg:p-4 lg:h-[78vh] align-center justify-end lg:sticky lg:w-[34%] lg:max-w-[800px] h-fit  w-[100%] top-6">
            <div className="flex flex-col border-black border-2 p-4 gap-4 justify-center sticky top-6">
              <div className="border-b-2 flex flex-col justify-between border-b-grey-200 cursor-pointer text-[16px] gap-3">
                <div
                  className="w-[100%] flex justify-between cursor-pointer"
                  onClick={() => {
                    handleCollapsibleState(1);
                  }}
                >
                  <div>DESCRIPTION</div>
                  <div>[+]</div>
                </div>
                <div
                  className={`duration-1000 transition-all  ${
                    collapsible[0]
                      ? "h-[100px] py-2 overflow-y-scroll"
                      : "h-0 py-0 overflow-hidden"
                  }`}
                >
                  {currentProduct.description}
                </div>
              </div>
              <div className="border-b-2 flex flex-col justify-between border-b-grey-200 cursor-pointer text-[16px] gap-3">
                <div
                  className="w-[100%] flex justify-between cursor-pointer"
                  onClick={() => {
                    handleCollapsibleState(2);
                  }}
                >
                  <div>MATERIALS</div>
                  <div>[+]</div>
                </div>
                <div
                  className={`duration-1000 transition-all overflow-y-scroll ${
                    collapsible[1]
                      ? "h-[100px] overflow-y-scroll py-2"
                      : "h-0 py-0 overflow-hidden"
                  }`}
                >
                  {currentProduct.materials}
                </div>
              </div>
              <div className="border-b-2 flex flex-col justify-between border-b-grey-200 cursor-pointer text-[16px] gap-3">
                <div
                  className="w-[100%] flex justify-between cursor-pointer"
                  onClick={() => {
                    handleCollapsibleState(3);
                  }}
                >
                  <div>PACKAGING</div>
                  <div>[+]</div>
                </div>
                <div
                  className={`duration-1000 transition-all ${
                    collapsible[2]
                      ? "h-[100px]  py-2 overflow-y-scroll"
                      : "h-0 py-0 overflow-hidden"
                  }`}
                >
                  {currentProduct.packaging}
                </div>
              </div>
              <div className="border-b-2 flex flex-col justify-between border-b-grey-200 cursor-pointer text-[16px] gap-3">
                <div
                  className="w-[100%] flex justify-between cursor-pointer"
                  onClick={() => {
                    handleCollapsibleState(4);
                  }}
                >
                  <div>SHIPPING & RETURNS</div>
                  <div>[+]</div>
                </div>
                <div
                  className={`duration-1000 transition-all  ${
                    collapsible[3]
                      ? "h-[100px] overflow-y-scroll py-2"
                      : "h-0 py-0 overflow-hidden"
                  }`}
                >
                  {currentProduct.shipping}
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4 lg:w-[50%] w-full">
            {productImages.map((productImage) => {
              return (
                <img
                  src={productImage}
                  alt=""
                  className="border p-1 border-gray-500"
                />
              );
            })}
            <div className="lg:hidden flex-col mb-10 border-black border-2 h-fit gap-3 ml-0 lg:ml-[10px] border-b-2 lg:sticky top-4 min-w-[250px] lg:w-[23%] w-[100%] flex">
              <div className="flex flex-col gap-2 p-4">
                <h1 className="text-[14px]">{currentProduct.productName}</h1>
                <div className="flex gap-2">
                  <h1 className="text-[12px] line-through">
                    Rs. {currentProduct.cancelledProductPrice}
                  </h1>
                  <h1 className="text-[12px]">
                    Rs.{currentProduct.productPrice}
                  </h1>
                </div>
              </div>
              <div className="text-[11px] px-4">
                {currentProduct.productInfo}
              </div>
              <div className="text-[10px] opacity-70 px-4 border-b-black pb-4 border-b-2">
                SHIPPING, EXCHANGES AND RETURNS
              </div>
              <div className="grid grid-cols-2  gap-1 w-fit mx-auto mt-6">
                {["S", "M", "L", "XL"].map((size) => {
                  return (
                    <>
                      <div
                        className={`border-2 border-black ${
                          size === current
                            ? "bg-black text-white"
                            : "bg-none text-black"
                        } py-3 w-[120px] text-center cursor-pointer`}
                        onClick={() => {
                          handleSwitch(size);
                        }}
                      >
                        {size}
                      </div>
                    </>
                  );
                })}
              </div>
              <div className="text-[9px] text-gray-900 px-4 opacity-70 pb-4">
                This product has a larger fit than usual. Model is wearing L.
              </div>

              <div className="text-[12px] text-gray-900">
                <button
                  className="w-full py-3 border-black border-2"
                  onClick={(event) => {
                    handleAddToCart(event);
                  }}
                >
                  ADD
                </button>
                <button className="w-full py-3 bg-black text-white">
                  BUY IT NOW
                </button>
              </div>
            </div>
          </div>
          <div className="hidden flex-col border-black border-2 h-fit gap-3 ml-0 lg:ml-[10px] border-b-2 lg:sticky top-4 min-w-[250px] lg:w-[33%] w-[100%] lg:flex">
            <div className="flex flex-col gap-2 p-4">
              <h1 className="text-[18px]">{currentProduct.productName}</h1>
              <div className="flex gap-2">
                <h1 className="text-[16px] line-through">
                  Rs. {currentProduct.cancelledProductPrice}
                </h1>
                <h1 className="text-[16px]">
                  Rs.{currentProduct.productPrice}
                </h1>
              </div>
            </div>
            <div className="text-[13px] px-4">{currentProduct.productInfo}</div>
            <div className="text-[10px] opacity-70 px-4 border-b-black pb-4 border-b-2">
              SHIPPING, EXCHANGES AND RETURNS
            </div>
            <div className="grid grid-cols-2  gap-1 w-fit mx-auto mt-6">
              {["S", "M", "L", "XL"].map((size) => {
                return (
                  <>
                    <div
                      className={`border-2 border-black ${
                        size === current
                          ? "bg-black text-white"
                          : "bg-none text-black"
                      } py-3 w-[120px] text-center cursor-pointer`}
                      onClick={() => {
                        handleSwitch(size);
                      }}
                    >
                      {size}
                    </div>
                  </>
                );
              })}
            </div>
            <div className="text-[9px] text-gray-900 px-4 opacity-70 pb-4">
              This product has a larger fit than usual. Model is wearing L.
            </div>

            <div className="text-[12px] text-gray-900">
              <button
                className="w-full py-3 border-black border-2"
                onClick={(event) => {
                  handleAddToCart(event);
                }}
              >
                ADD
              </button>
              <button className="w-full py-3 bg-black text-white">
                BUY IT NOW
              </button>
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
            },
          }}
        >
          <Image src={logo} alt="preloader" width={60} height={60}></Image>
        </motion.div>
      )}
    </>
  );
};

export default Preview;
