"use client";
import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Card from "@/components/Card";
import axios from "axios";
import { useState } from "react";
import { useEffect } from "react";
import { useContext } from "react";
import { GlobalContext } from "@/context/Global";
import Image from "next/image";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { useAlert } from "@/context/AlertContext";
import { useUser } from "@clerk/nextjs";

/**
 * 1.Pretty exhausting function (handleBag) running in O(n^2) probably. Considering the post requests to be linear.
 * 2.The mechanism is straightforward, if an item from the wishlist is not present in the global cart, add it.
 * 3.T̶O̶D̶O̶:̶ b̶u̶g̶:̶ g̶l̶o̶b̶a̶l̶ c̶a̶r̶t̶ i̶s̶ u̶p̶d̶a̶t̶e̶d̶ b̶u̶t̶ t̶h̶e̶ d̶a̶t̶a̶b̶a̶s̶e̶ w̶a̶s̶ n̶o̶t̶ u̶p̶d̶a̶t̶e̶d̶.̶ (̶f̶i̶x̶e̶d̶)̶
 * 3.T̶O̶D̶O̶:̶ b̶u̶g̶: n̶u̶l̶l̶ |̶ u̶n̶d̶e̶f̶i̶n̶e̶d̶ |̶ [̶]̶ r̶e̶s̶p̶o̶n̶s̶e̶ w̶i̶l̶l̶ m̶e̶s̶s̶ w̶i̶t̶h̶ t̶h̶e̶ m̶a̶p̶ f̶u̶n̶c̶t̶i̶o̶n̶ (̶f̶i̶x̶e̶d̶)̶
 */

const logo = "/logo.png";

interface Product {
  _id: string;
  productName: string;
  productPrice: string;
  cancelledProductPrice: string;
  productImages: string[];
  latest: boolean;
}

interface ApiResponse {
  wishlist: string[];
}

type ApiResponseOr404 = ApiResponse | 404;

const Page = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentWishlist, setCurrentWishlist] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const { showAlert } = useAlert();
  const user = useUser();
  const router = useRouter();

  const url_params = useParams();

  const {
    GlobalWishlist,
    GlobalCart,
    changeGlobalWishlist,
    changeGlobalCart,
  }: any = useContext(GlobalContext);

  useEffect(() => {
    const checkAuth = async () => {
      if (!user.isSignedIn) {
        showAlert("Please sign in to access your wishlist", "warning");
        router.push("/sign-in");
        return;
      }

      await propagate_data();
    };
    
    if (GlobalWishlist) {
      checkAuth();
    }
  }, [user.isSignedIn, GlobalWishlist, showAlert, router]);

  const propagate_data = async () => {
    try {
      // Fetch both data in parallel
      const [productsResponse, wishlistResponse] = await Promise.all([
        axios.post<Product[]>(`/api/propagation/`, { every: true }),
        axios.get<ApiResponseOr404>(`/api/propagation_client/`)
      ]);

      setProducts(productsResponse.data || []);
      
      if (wishlistResponse.data === 404 || !wishlistResponse.data) {
        console.error("Could not fetch wishlist data");
        setCurrentWishlist([]);
      } else {
        const { wishlist = [] } = wishlistResponse.data;
        setCurrentWishlist(wishlist);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setProducts([]);
      setCurrentWishlist([]);
    } finally {
      setLoaded(true);
    }
  };

  const handleBag = async () => {
    if (!user.isSignedIn) {
      showAlert("Please sign in to access cart", "warning");
      setTimeout(() => {
        window.location.href = "/sign-in";
      }, 2000);
      return;
    }

    if (!currentWishlist.length) {
      showAlert("Your wishlist is empty", "warning");
      return;
    }

    try {
      // Get items that are not in cart
      const itemsToAdd = currentWishlist.filter(item => !GlobalCart.includes(item));
      
      if (itemsToAdd.length === 0) {
        showAlert("All items are already in your cart", "info");
        return;
      }

      // Add each item to cart
      for (const item of itemsToAdd) {
        await axios.post(`/api/cart`, {
          identifier: item,
          append: true,
        });
        changeGlobalCart(item);
      }

      showAlert(`Successfully moved ${itemsToAdd.length} items to cart`, "success");
    } catch (error) {
      console.error("Error moving items to cart:", error);
      showAlert("Error moving items to cart. Please try again.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/" className="text-gray-600 hover:text-[#DB4444] transition-colors duration-300 ease-in-out">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-[#DB4444]">Wishlist</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Loading State */}
        {!loaded && (
          <div className="h-screen flex items-center justify-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-[#DB4444] border-t-transparent rounded-full animate-spin"></div>
              <Image 
                src={logo} 
                alt="Loading..." 
                width={40} 
                height={40} 
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse"
              />
            </div>
          </div>
        )}

        {/* Main Content */}
        {loaded && (
          <div className="space-y-8">
            {/* Header Section */}
            <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 ease-in-out p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">My Wishlist</h1>
                  <p className="text-gray-600 mt-1">
                    {currentWishlist.length} {currentWishlist.length === 1 ? 'item' : 'items'} saved
                  </p>
                </div>
                <button
                  onClick={handleBag}
                  disabled={!currentWishlist.length}
                  className={`inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white ${
                    currentWishlist.length 
                      ? 'bg-[#DB4444] hover:bg-[#c13a3a]' 
                      : 'bg-gray-400 cursor-not-allowed'
                  } transition-all duration-300 ease-in-out shadow-sm hover:shadow-md transform hover:scale-105`}
                >
                  <svg className="w-5 h-5 mr-2 transform group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Move All to Cart
                </button>
              </div>
            </div>

            {/* Empty State */}
            {currentWishlist.length === 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 ease-in-out p-12 text-center"
              >
                <div className="w-24 h-24 mx-auto mb-6 text-gray-400 animate-bounce">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Your wishlist is empty</h3>
                <p className="text-gray-600 mb-6">Save items you like to your wishlist to keep track of them</p>
                <a
                  href="/Products"
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-[#DB4444] hover:bg-[#c13a3a] transition-all duration-300 ease-in-out shadow-sm hover:shadow-md transform hover:scale-105"
                >
                  Start Shopping
                </a>
              </motion.div>
            )}

            {/* Products Grid */}
            {currentWishlist.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product: any, index: any) => {
                  if (currentWishlist.includes(product._id)) {
                    return (
                      <motion.div
                        key={product._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="transform hover:scale-[1.02] transition-all duration-300 ease-in-out"
                      >
                        <Card
                          id={product._id}
                          productName={product.productName}
                          productPrice={Number(product.productPrice)}
                          cancelledPrice={product.cancelledProductPrice}
                          src={
                            product.productImages[0] === undefined
                              ? "https://fastly.picsum.photos/id/1050/536/354.jpg?hmac=fjxUSeQRIROZvo_be9xEf-vMhMutXf2F5yw-WaWyaWA"
                              : product.productImages[0]
                          }
                          status={product.latest ? "new" : "old"}
                          isWishlist={true}
                        />
                      </motion.div>
                    );
                  }
                })}
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Page;
