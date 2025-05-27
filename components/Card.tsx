"use client";
import React, { useContext, useState } from "react";
import axios from "axios";
import { GlobalContext } from "@/context/Global";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useAlert } from "@/context/AlertContext";
import Link from "next/link";

type propType = {
  id: string;
  src: string;
  productName: string;
  productPrice: number;
  cancelledPrice: number;
  status: string;
  isWishlist?: boolean;
};

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
        changeGlobalCart(id);
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
    <div className="group relative bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 ease-in-out overflow-hidden">
      <Link href={`/ProductDetails/${id}`}>
        <div className="aspect-square relative overflow-hidden bg-gray-100 rounded-t-lg">
          <Image
            src={src}
            alt={productName}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
          {status === "new" && (
            <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
              New
            </div>
          )}
        </div>
      </Link>
      
      {/* Wishlist Button */}
      <button
        onClick={handleWishlistPresence}
        disabled={loadingWishlist}
        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-all duration-200"
      >
        {loadingWishlist ? (
          <div className="w-4 h-4 border-2 border-[#DB4444] border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill={GlobalWishlist.includes(id) ? "#DB4444" : "none"}
            stroke="#DB4444"
            strokeWidth="1.5"
          >
            <path d="M8 5C5.7912 5 4 6.73964 4 8.88594C4 10.6185 4.7 14.7305 11.5904 18.8873C11.7138 18.961 11.8555 19 12 19C12.1445 19 12.2862 18.961 12.4096 18.8873C19.3 14.7305 20 10.6185 20 8.88594C20 6.73964 18.2088 5 16 5C13.7912 5 12 7.35511 12 7.35511C12 7.35511 10.2088 5 8 5Z" />
          </svg>
        )}
      </button>

      <div className="p-4">
        <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 group-hover:text-[#DB4444] transition-colors duration-300">
          {productName}
        </h3>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-semibold text-[#DB4444]">
            ₹{productPrice}
          </span>
          {cancelledPrice > productPrice && (
            <>
              <span className="text-sm text-gray-500 line-through">
                ₹{cancelledPrice}
              </span>
              <span className="text-xs font-medium text-green-600">
                {Math.round(((cancelledPrice - productPrice) / cancelledPrice) * 100)}% OFF
              </span>
            </>
          )}
        </div>
        
        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={loadingCart}
          className="w-full bg-[#DB4444] text-white font-medium py-2 px-4 rounded-md hover:bg-black transition-colors duration-200 flex items-center justify-center gap-2"
        >
          {loadingCart ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {GlobalCart.includes(id) ? "Remove" : "Add to Cart"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
