"use client";
import React, { useContext, useState } from "react";
import axios from "axios";
import { GlobalContext } from "@/context/Global";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useAlert } from "@/context/AlertContext";

type propType = {
  id: string;
  thumbnail: string;
  productName: string;
  productPrice: number;
  cancelledPrice: number;
  status: string;
  soldOut?: boolean;
  isWishlist?: boolean;
};

const heart = "/heart.svg";

const domain = process.env.NEXT_PUBLIC_DOMAIN;

export default function Card({
  id,
  thumbnail,
  productName,
  productPrice,
  cancelledPrice,
  status,
  soldOut = false,
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
    
    // Prevent interaction if sold out
    if (soldOut) {
      showAlert("This product is sold out", "warning");
      return;
    }
    
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
      const response = await axios.post<{ success: boolean; error?: string }>(`/api/wishlist`, {
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
        showAlert("Error updating wishlist. Please try again.", "error");
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
      showAlert("Error updating wishlist. Please try again.", "error");
    } finally {
      setLoadingWishlist(false);
    }
  };

  const handleAddToCart = async (event: React.MouseEvent) => {
    event.stopPropagation();
    
    // Prevent interaction if sold out
    if (soldOut) {
      showAlert("This product is sold out", "warning");
      return;
    }
    
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
        // Wait for the global cart to be updated from server
        await changeGlobalCart(id);
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

  const handleCardClick = () => {
    // Allow navigation to product page even if sold out
    window.location.href = `/ProductDetails/${id}`;
  };

  return (
    <div
      onClick={handleCardClick}
      className={`w-full overflow-hidden relative flex flex-col gap-4 cursor-pointer group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 ${soldOut ? 'opacity-75' : ''}`}
    >
      <div className="card-body flex justify-center relative aspect-[3/4] w-full rounded-t-lg overflow-hidden">
        <Image
          src={thumbnail}
          alt={productName}
          fill
          className={`object-cover relative bg-[#F5F5F5] transition-transform duration-300 ${soldOut ? 'grayscale' : 'group-hover:scale-105'}`}
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        />
        
        {/* Sold Out Overlay */}
        {soldOut && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
            <span className="bg-red-600 text-white px-4 py-2 text-sm font-bold tracking-wider rounded-md">
              SOLD OUT
            </span>
          </div>
        )}
        
        {status === "new" && !soldOut && (
          <div className="absolute top-3 left-3">
            <span className="bg-black text-white px-3 py-1 text-xs font-semibold tracking-wider rounded-full">
              NEW
            </span>
          </div>
        )}

        {/* Wishlist Button - disabled for sold out */}
        {isWishlist && (
          <button
            onClick={handleWishlistPresence}
            disabled={loadingWishlist || soldOut}
            className={`absolute top-3 right-3 w-[35px] h-[35px] rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-all duration-200 ${
              loadingWishlist || soldOut ? "opacity-50" : "opacity-100"
            }`}
          >
            {loadingWishlist ? (
              <div className="w-5 h-5 border-2 border-[#DB4444] border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#DB4444"
                xmlns="http://www.w3.org/2000/svg"
                className="transition-all duration-200"
              >
                <path
                  d="M18 6L6 18M6 6l12 12"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        )}

        {!isWishlist && (
          <button
            onClick={handleWishlistPresence}
            disabled={loadingWishlist || soldOut}
            className={`absolute top-3 right-3 w-[35px] h-[35px] rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-all duration-200 ${
              loadingWishlist || soldOut ? "opacity-50" : "opacity-100"
            }`}
          >
            {loadingWishlist ? (
              <div className="w-5 h-5 border-2 border-[#DB4444] border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill={GlobalWishlist.includes(id) ? "#DB4444" : "none"}
                xmlns="http://www.w3.org/2000/svg"
                className="transition-all duration-200"
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

        {/* Cart Button Overlays - disabled for sold out */}
        {isWishlist ? (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 hidden md:block">
            <button
              onClick={handleAddToCart}
              disabled={loadingCart || soldOut}
              className={`w-full font-medium py-2.5 px-4 rounded-md transition-colors duration-200 flex items-center justify-center gap-2 ${
                soldOut 
                  ? "bg-gray-400 text-gray-600 cursor-not-allowed" 
                  : "bg-white text-black hover:bg-[#DB4444] hover:text-white"
              }`}
            >
              {soldOut ? (
                "Sold Out"
              ) : loadingCart ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {GlobalCart.includes(id) ? "Remove from cart" : "Add to cart"}
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 hidden md:block">
            <button
              onClick={handleAddToCart}
              disabled={loadingCart || soldOut}
              className={`w-full font-medium py-2.5 px-4 rounded-md transition-colors duration-200 flex items-center justify-center gap-2 ${
                soldOut 
                  ? "bg-gray-400 text-gray-600 cursor-not-allowed" 
                  : "bg-[#DB4444] text-white hover:bg-black"
              }`}
            >
              {soldOut ? (
                "Sold Out"
              ) : loadingCart ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {GlobalCart.includes(id) ? "Remove from cart" : "Add to cart"}
                </>
              )}
            </button>
          </div>
        )}
      </div>
      <div className="card-details flex flex-col gap-2 p-4">
        <h1 className="font-semibold text-gray-900 line-clamp-2">{productName}</h1>
        <div className="flex items-center gap-2">
          <span className={`font-bold ${soldOut ? 'text-gray-400' : 'text-[#DB4444]'}`}>Rs. {productPrice}</span>
          <span className="text-gray-400 line-through text-sm">Rs. {cancelledPrice}</span>
          {cancelledPrice > productPrice && !soldOut && (
            <span className="text-xs font-medium text-green-600">
              {Math.round(((cancelledPrice - productPrice) / cancelledPrice) * 100)}% OFF
            </span>
          )}
        </div>
        {/* Mobile Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={loadingCart || soldOut}
          className={`hidden w-full font-medium py-2.5 px-4 rounded-md transition-colors duration-200 items-center justify-center gap-2 mt-2 ${
            soldOut 
              ? "bg-gray-400 text-gray-600 cursor-not-allowed" 
              : "bg-[#DB4444] text-white hover:bg-black"
          }`}
        >
          {soldOut ? (
            "Sold Out"
          ) : loadingCart ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {GlobalCart.includes(id) ? "Remove from cart" : "Add to cart"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
