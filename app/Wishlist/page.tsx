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
import { useParams } from "next/navigation";

/**
 * 1.Pretty exhausting function (handleBag) running in O(n^2) probably. Considering the post requests to be linear.
 * 2.The mechanism is straightforward, if an item from the wishlist is not present in the global cart, add it.
 * 3.T̶O̶D̶O̶:̶ b̶u̶g̶:̶ g̶l̶o̶b̶a̶l̶ c̶a̶r̶t̶ i̶s̶ u̶p̶d̶a̶t̶e̶d̶ b̶u̶t̶ t̶h̶e̶ d̶a̶t̶a̶b̶a̶s̶e̶ w̶a̶s̶ n̶o̶t̶ u̶p̶d̶a̶t̶e̶d̶.̶ (̶f̶i̶x̶e̶d̶)̶
 * 3.T̶O̶D̶O̶:̶ b̶u̶g̶: n̶u̶l̶l̶ |̶ u̶n̶d̶e̶f̶i̶n̶e̶d̶ |̶ [̶]̶ r̶e̶s̶p̶o̶n̶s̶e̶ w̶i̶l̶l̶ m̶e̶s̶s̶ w̶i̶t̶h̶ t̶h̶e̶ m̶a̶p̶ f̶u̶n̶c̶t̶i̶o̶n̶ (̶f̶i̶x̶e̶d̶)̶
 */

const logo = "/logo.png";

const Page = () => {
  const [products, setProducts] = useState([]);
  const [currentWishlist, setCurrentWishlist] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const url_params = useParams();

  const {
    GlobalWishlist,
    GlobalCart,
    changeGlobalWishlist,
    changeGlobalCart,
  }: any = useContext(GlobalContext);

  useEffect(() => {
    const propagate_data = async () => {
      const localProducts = await axios
        .post(`/api/propagation/`, {
          every: true,
        })
        .then((response) => {
          return response.data;
        });
      setProducts(localProducts);
      const currentWishlist = await axios
        .get(`/api/propagation_client/`)
        .then((response) => {
          if (response.data === 404) {
            console.log(
              "Couldn't get the current wishlist from the database, try refreshing the page. Developers are supposed to check /api/propagation_client"
            );
            return [];
          } else {
            return response.data.wishlist;
          }
        });

      setCurrentWishlist(currentWishlist);
      // TODO: remove in production.
      setTimeout(() => {
        setLoaded(true);
      }, 1000);
    };
    propagate_data();
  }, [GlobalWishlist]);

  const handleBag = async () => {
    for (let i = 0; i < GlobalWishlist.length; ++i) {
      if (!GlobalCart.includes(GlobalWishlist[i])) {
        const response = await axios
          .post(`/api/cart`, {
            identifier: GlobalWishlist[i],
            append: true,
          })
          .then((res) => {
            if (res.data === 200) {
              changeGlobalCart(GlobalWishlist[i]);
              alert("Cart updated!");
            } else {
              alert(
                "There was an error in updating the cart. Try refreshing the page."
              );
            }
          });
      }
    }
  };

  return (
    <div>
      <Navbar />
      <div className="p-4">
        <div className="mt-6 ml-4 xl:ml-32">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Wishlist</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
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
        {loaded && (
          <div className="flex flex-col xl:flex-col xl:justify-between xl:w-[1170px] w-full xl:ml-28 mt-8">
            <div className="flex flex-col xl:flex-row xl:justify-between">
              <div>
                <h1 className="p-5">Wishlist ({currentWishlist.length})</h1>
              </div>
              <div>
                <button
                  className="w-full xl:w-[223px] h-[56px] text-center border border-black"
                  onClick={handleBag}
                >
                  Move All to bag
                </button>
              </div>
            </div>

            <div className="flex flex-col xl:flex-row gap-x-5 w-full mt-7">
              {products.length &&
                products.map((product: any, index: any) => {
                  let smol: any = product._id;
                  if (currentWishlist.includes(smol)) {
                    return (
                      <Card
                        id={product._id}
                        key={index}
                        productName={product.productName}
                        productPrice={Number(product.productPrice)}
                        cancelledPrice={product.cancelledProductPrice}
                        src={
                          product.productImages[0] === undefined
                            ? "https://fastly.picsum.photos/id/1050/536/354.jpg?hmac=fjxUSeQRIROZvo_be9xEf-vMhMutXf2F5yw-WaWyaWA"
                            : product.productImages[0]
                        }
                        status={product.latest ? "new" : "old"}
                      ></Card>
                    );
                  }
                })}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Page;
