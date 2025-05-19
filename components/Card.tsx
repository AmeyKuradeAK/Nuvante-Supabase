"use client";
import React, { useContext, useState } from "react";
import axios from "axios";
import { GlobalContext } from "@/context/Global";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useAlert } from "@/context/AlertContext";

type propType = {
  id: string;
  src: string;
  productName: string;
  productPrice: number;
  cancelledPrice: number;
  status: string;
  isWishlist?: boolean;
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
  isWishlist = false,
}: propType) {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error("GlobalContext is not provided.");
  }

  const user = useUser();
  const { showAlert } = useAlert();

  const { GlobalWishlist, changeGlobalWishlist, GlobalCart, changeGlobalCart } = context;

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
    if (!user.isSignedIn) {
      showAlert("Please sign in to access wishlist", "warning");
      setTimeout(() => {
        window.location.href = "/sign-in";
      }, 2000);
      return;
    }
    setLoadingWishlist(true);

    try {
      const isPresent = GlobalWishlist.includes(id);
      const response = await axios.post<{ success: boolean; error?: string; details?: string }>(`/api/wishlist`, {
        identifier: id,
        append: !isPresent,
      });

      if (response.status === 200 && response.data.success) {
        const updatedWishlist = isPresent
          ? GlobalWishlist.filter((item) => item !== id)
          : [...GlobalWishlist, id];

        changeGlobalWishlist(updatedWishlist);
        showAlert(
          isPresent ? "Removed from wishlist" : "Added to wishlist",
          "success"
        );
      } else {
        showAlert(response.data.error || "Error updating wishlist. Please try again.", "error");
      }
    } catch (error: any) {
      console.error("Error updating wishlist:", error);
      if (error.response?.status === 401) {
        showAlert("Please sign in to access wishlist", "warning");
        setTimeout(() => {
          window.location.href = "/sign-in";
        }, 2000);
      } else {
        const errorMessage = error.response?.data?.error || error.response?.data?.details || "Error updating wishlist. Please try again.";
        showAlert(errorMessage, "error");
      }
    } finally {
      setLoadingWishlist(false);
    }
  };

  const handleAddToCart = async (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!user.isSignedIn) {
      showAlert("Please sign in to access cart", "warning");
      setTimeout(() => {
        window.location.href = "/sign-in";
      }, 2000);
      return;
    }
    setLoadingCart(true);

    try {
      const isPresent = GlobalCart.includes(id);
      const response = await axios.post(`/api/cart`, {
        identifier: id,
        append: !isPresent,
      });

      if (response.status === 200) {
        const updatedCart = isPresent
          ? GlobalCart.filter((item) => item !== id)
          : [...GlobalCart, id];

        changeGlobalCart(updatedCart[0]); // Since changeGlobalCart expects a single string
        showAlert(
          isPresent ? "Removed from cart" : "Added to cart",
          "success"
        );
      } else {
        showAlert("Error updating cart. Please try again.", "error");
      }
    } catch (error) {
      console.error("Error updating cart:", error);
      showAlert("Error updating cart. Please try again.", "error");
    } finally {
      setLoadingCart(false);
    }
  };

  return (
    <div
      onClick={() => (window.location.href = `/ProductDetails/${id}`)}
      className="w-full overflow-hidden relative flex flex-col gap-4 cursor-pointer group"
    >
      <div className="card-body flex justify-center relative aspect-[3/4] w-full rounded-lg">
        <img
          src={src}
          alt={productName}
          className="w-full h-full object-cover relative bg-[#F5F5F5]"
        />
        {status === "new" && (
          <h1 className="absolute top-1 left-1 rounded-lg bg-black px-3 py-1 text-white text-sm font-bold">
            NEW
          </h1>
        )}

        {!isWishlist && (
          <button
            onClick={handleWishlistPresence}
            disabled={loadingWishlist}
            className={`absolute top-2 right-3 w-[30px] h-[30px] ${
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
                fill={GlobalWishlist.includes(id) ? "#DB4444" : "none"}
                xmlns="http://www.w3.org/2000/svg"
                className="transition-all duration-200 drop-shadow-sm"
              >
                <path
                  d="M8 5C5.7912 5 4 6.73964 4 8.88594C4 10.6185 4.7 14.7305 11.5904 18.8873C11.7138 18.961 11.8555 19 12 19C12.1445 19 12.2862 18.961 12.4096 18.8873C19.3 14.7305 20 10.6185 20 8.88594C20 6.73964 18.2088 5 16 5C13.7912 5 12 7.35511 12 7.35511C12 7.35511 10.2088 5 8 5Z"
                  stroke="#DB4444"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        )}

        {isWishlist ? (
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex flex-col gap-2 w-[270px]">
            <button
              onClick={handleWishlistPresence}
              disabled={loadingWishlist}
              className="font-bold bg-[#DB4444] text-white w-full py-2 px-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              {loadingWishlist ? "⏳" : "Remove from wishlist"}
            </button>
            <button
              onClick={handleAddToCart}
              disabled={loadingCart}
              className="font-bold bg-black text-white w-full py-2 px-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              {loadingCart ? "⏳" : "Move to cart"}
            </button>
          </div>
        ) : (
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
        )}
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
