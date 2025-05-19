"use client";
import React, { useContext, useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import axios from "axios";
import { GlobalContext } from "@/context/Global";
import Button from "@/components/button";
import { motion } from "framer-motion";

const logo = "/logo.png";

const CartTotal = ({ subtotal }: { subtotal: number }) => {
  return (
    <div className=" rounded-md p-10 w-full md:w-80 sm:m-0 m-auto border-4 border-black flex flex-col gap-3 ">
      <h2 className="text-lg font-semibold mb-4">Cart Total</h2>
      <div className="flex justify-between mb-2">
        <span>Subtotal:</span>
        <span>Rs. {subtotal}</span>
      </div>
      <div className="flex justify-between mb-4">
        <span>Shipping:</span>
        <span>Free</span>
      </div>
      <div className="flex justify-between font-semibold text-lg">
        <span>Total:</span>
        <span>Rs. {subtotal}</span>
      </div>
      <div className="w-[90%] sm:w-[250px]">
        <Button text="Proceed to Checkout" width={250} />
      </div>
    </div>
  );
};

const CartPage = () => {
  const [morphedProducts, setMorphedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});

  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error("GlobalContext is not provided.");
  }

  const { GlobalCart, changeGlobalCart } = context;

  const asyncHandler = async () => {
    try {
      const response = await axios
        .post(`/api/propagation`, {
          every: true,
        })
        .then((res) => {
          if (res.data === 404) {
            alert(
              "there was an error fetching cart products, please try again after refreshing the page."
            );
            alert("redirecting to home page.");
            window.location.href = "/";
          } else {
            setMorphedProducts(res.data === null ? [] : res.data);
          }
        });
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    asyncHandler();
  }, []);

  const handleQuantityChange = (id: string, value: number) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: value < 1 ? 1 : value,
    }));
  };

  const calculateSubtotal = () => {
    return morphedProducts.reduce((total, item) => {
      if (!GlobalCart.includes(item._id)) return total;
      return total + (quantities[item._id] || 1) * item.productPrice;
    }, 0);
  };

  const handleRemoveItem = async (id: string) => {
    console.log(`Remove item with ID: ${id}`);
    const response = await axios
      .post(`/api/cart`, {
        append: false,
        identifier: id,
      })
      .then((res) => {
        if (res.data === 404) {
          alert("There was a problem setting data in the context.");
        } else if (res.data === 200) {
          changeGlobalCart((prevGlobalCart: any) => {
            return prevGlobalCart.filter((element: any) => {
              element != id;
            });
          });
        }
      });
  };

  return (
    <>
      <div>
        {loading && (
          <motion.div
            className="w-fit mx-auto mt-20"
            animate={{
              rotate: 360,
              transition: {
                duration: 1.5,
              },
            }}
          >
            <img src={logo} alt="preloader" width={60} height={60} />
          </motion.div>
        )}
        {!loading && (
          <>
            <Navbar />
            <div className="p-4 flex justify-center">
              <div className="flex flex-col w-[80vw] space-y-4 mt-16">
                <div className="hidden md:flex flex-row items-center justify-between h-[72px] w-full border rounded-sm bg-white px-4">
                  <h1 className="flex-[2] text-left">Product</h1>
                  <h1 className="flex-[1] text-center">Price</h1>
                  <h1 className="flex-[2] text-center">Quantity</h1>
                  <h1 className="flex-[1] text-center">Subtotal</h1>
                </div>

                {morphedProducts.map((item) => {
                  if (!GlobalCart.includes(item._id)) return null;

                  return (
                    <div
                      key={item._id}
                      className="flex flex-col md:flex-row items-center justify-between border rounded-sm bg-white p-4 space-y-4 md:space-y-0"
                    >
                      <div className="relative flex-[2] flex items-center space-x-4">
                        <img
                          src={item.productImages[0]}
                          alt={item.productName}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <button
                          onClick={() => handleRemoveItem(item._id)}
                          className="absolute top-[-16px] left-[-20px] text-red-500 bg-none rounded-[50%] p-1 hover:bg-red-100"
                          aria-label="Remove item"
                        >
                          <img
                            src="/cancel.png"
                            alt="Remove"
                            className="w-4 h-4 object-contain"
                          />
                        </button>
                        <h1 className="text-left">{item.productName}</h1>
                      </div>

                      <h1 className="flex-[1] text-center">
                        Rs. {item.productPrice}
                      </h1>

                      <div className="flex-[2] flex items-center justify-center space-x-2">
                        <button
                          onClick={() =>
                            handleQuantityChange(
                              item._id,
                              (quantities[item._id] || 1) - 1
                            )
                          }
                          className="px-2 py-1 border rounded bg-gray-200 hover:bg-gray-300"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={quantities[item._id] || 1}
                          onChange={(event) =>
                            handleQuantityChange(
                              item._id,
                              parseInt(event.target.value) || 1
                            )
                          }
                          className="w-12 text-center border rounded"
                          min={1}
                        />
                        <button
                          onClick={() =>
                            handleQuantityChange(
                              item._id,
                              (quantities[item._id] || 1) + 1
                            )
                          }
                          className="px-2 py-1 border rounded bg-gray-200 hover:bg-gray-300"
                        >
                          +
                        </button>
                      </div>

                      <h1 className="flex-[1] text-center">
                        Rs. {(quantities[item._id] || 1) * item.productPrice}
                      </h1>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex justify-between w-[81%] mx-auto my-4">
              <div
                onClick={() => {
                  window.location.href = "/";
                }}
                className="w-fit mx-auto"
              >
                <Button text="Return To Shop" width={200}></Button>
              </div>
            </div>

            <div className="flex w-[80%] mx-auto justify-center items-center  md:justify-between md:items-start mt-20 flex-col flex-wrap md:flex-row">
              <div className="flex justify-start  my-6 w-fit">
                <div className="flex items-center space-x-4 flex-col sm:flex-row gap-1">
                  <input
                    type="text"
                    style={{
                      height: "50px",
                      border: "2px solid black",
                      padding: "3px",
                      borderRadius: "0.375rem",
                      margin: "auto",
                    }}
                    placeholder="Coupon Code"
                    className="border rounded px-4 py-2 w-64 focus:outline-none focus:ring focus:ring-red-300"
                  />
                  <Button text="Apply Coupon" width={150} />
                </div>
              </div>
              <div className="flex justify-center my-6 w-[90%] sm:w-fit">
                <CartTotal subtotal={calculateSubtotal()} />
              </div>
            </div>
            <Footer />
          </>
        )}
      </div>
    </>
  );
};

export default CartPage;
