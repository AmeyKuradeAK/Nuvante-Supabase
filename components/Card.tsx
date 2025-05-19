"use client";
import React, { useContext, useState } from "react";
import axios from "axios";
import { GlobalContext } from "@/context/Global";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";

type propType = {
  id: string;
  src: string;
  productName: string;
  productPrice: number;
  cancelledPrice: number;
  status: string;
};

const heart = "/heart.svg";

const domain = process.env.NEXT_PUBLIC_DOMAIN;

export default function Card({
  id,
  src,
  productName,
  productPrice,
  cancelledPrice,
  status,
}: propType) {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error("GlobalContext is not provided.");
  }

  const user = useUser();

  const { GlobalWishlist, changeGlobalWishlist, GlobalCart, changeGlobalCart } =
    context;

  const [loadingWishlist, setLoadingWishlist] = useState(false);
  const [loadingCart, setLoadingCart] = useState(false);

  // console.log("From card.tsx: ", GlobalWishlist);

  /**
   * 1.Handles the obnoxious operations related to wishlist using a global context.
   * 2.stopPropagation stops the default event listener on the card itself.
   * 3.loadingWishlist handles the timer effect you see after clicking on wishlist.
   * 4.isPresent is checking if the current id is already present in the globalWishlist/globalCart, if yes don't append, just delete, otherwise append. (kind of similar to a toggle state used when making a navbar)
   * 5.Promises are handled so that null data is not provided to the global state.
   */
  const handleWishlistPresence = async (event: React.MouseEvent) => {
    event.stopPropagation();
    console.log(user);
    if (!user.isSignedIn) {
      alert("You are not signed in, please sign in first to access wishlist!");
      alert("Redirecting...");
      window.location.href = "/sign-in";
      return;
    }
    setLoadingWishlist(true);

    try {
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
            setLoadingWishlist(false);
            console.log(updatedWishlist);
          } else if (response.data === parseInt("404")) {
            alert(
              "there was an error updating the wishlist! Try refreshing the page!"
            );
            setLoadingWishlist(false);
          }
        });
    } catch (error) {
      console.error("Error updating wishlist:", error);
      alert(
        "There was an error updating the wishlist! Try refreshing the page."
      );
    }
  };

  const handleAddToCart = async (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!user.isSignedIn) {
      alert("You are not signed in, please sign in first to access cart!");
      alert("Redirecting...");
      window.location.href = "/sign-in";
      return;
    }
    setLoadingCart(true);

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
            setLoadingCart(false);
          } else if (response.data === parseInt("404")) {
            alert(
              "there was an error updating the cart! Try refreshing the page!"
            );
          }
        });
    } catch (error) {
      console.error("Error updating wishlist:", error);
    }
  };

  return (
    <div
      onClick={() => (window.location.href = `/ProductDetails/${id}`)}
      className=" w-full overflow-hidden sm:w-auto relative flex flex-col gap-4 cursor-pointer group"
    >
      <div className="card-body flex sm:justify-center justify-center relative h-[380px] sm:w-fit w-fit mx-auto rounded-lg">
        <img
          src={src}
          alt={productName}
          className=" w-[290px] h-full relative bg-[#F5F5F5]"
        />
        {status === "new" && (
          <h1 className="absolute top-1 left-1 rounded-lg bg-black px-3 py-1 text-white text-sm font-bold">
            NEW
          </h1>
        )}

        <button
          onClick={handleWishlistPresence}
          disabled={loadingWishlist}
          className={`absolute rounded-full top-2 right-3 w-[30px] h-[30px] bg-white ${
            loadingWishlist ? "opacity-50" : "opacity-100"
          } hover:opacity-100 transition-opacity`}
        >
          {loadingWishlist ? (
            "⏳"
          ) : (
            <svg
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill={`${GlobalWishlist.includes(id) ? "#DB4444" : "none"}`}
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8 5C5.7912 5 4 6.73964 4 8.88594C4 10.6185 4.7 14.7305 11.5904 18.8873C11.7138 18.961 11.8555 19 12 19C12.1445 19 12.2862 18.961 12.4096 18.8873C19.3 14.7305 20 10.6185 20 8.88594C20 6.73964 18.2088 5 16 5C13.7912 5 12 7.35511 12 7.35511C12 7.35511 10.2088 5 8 5Z"
                stroke={`${GlobalWishlist.includes(id) ? "#DB4444" : "black"}`}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
        <button
          onClick={handleAddToCart}
          disabled={loadingCart}
          className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 font-bold bg-black text-white w-[270px] py-2 px-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
        >
          {loadingCart
            ? "⏳"
            : GlobalCart.includes(id)
            ? "Remove from cart"
            : "Add to cart"}
        </button>
      </div>
      <div className="card-details flex flex-col gap-3  text-center uppercase">
        <h1 className="font-extrabold text-black">{productName}</h1>
        <div className="flex gap-2 text-center mx-auto w-fit uppercase">
          <h1 className="text-[#DB4444] font-extrabold">Rs. {productPrice}</h1>
          <h1 className="line-through text-gray-500 font-extrabold">
            Rs. {cancelledPrice}
          </h1>
        </div>
      </div>
    </div>
  );
}
