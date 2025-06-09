"use client";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Heading from "@/components/Heading";
import Card from "@/components/Card";
import productModel from "@/models/Product";
import { headers } from "next/headers";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";

const Page = () => {
  const [data, setData]: any[] = useState([]);
  const params = useParams();
  const [loaded, setLoaded] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      try {
        const response = await axios.post("/api/propagation", {
          every: true,
        });
        setData(response.data);
        setLoaded(true);
      } catch (error) {
        setData([]);
      }
    })();
  }, []);

  return (
    <>
      <div>
        <Navbar />
        <div className="p-4">
          <div className="mt-6 ml-4 xl:ml-32">
            <div className="flex flex-col gap-6">
              <div className="flex w-full justify-between items-center">
                <Heading message="Products" secondaryMessage="" />
              </div>
              <div className="flex flex-col gap-12">
                <div className="cards flex flex-wrap sm:w-auto w-[100%] gap-y-10 gap-x-10">
                  {loaded ? (
                    data.length > 0 ? (
                      data.map((product: any, index: any) =>
                        product.type === params?.slug ? (
                          <Card
                            id={product._id}
                            key={index}
                            productName={product.productName}
                            productPrice={product.productPrice}
                            cancelledPrice={product.cancelledProductPrice}
                            thumbnail={product.thumbnail || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=536&h=354&fit=crop&crop=center"}
                            status={product.latest ? "new" : "old"}
                            soldOut={product.soldOut || false}
                          />
                        ) : (
                          ""
                        )
                      )
                    ) : (
                      <p>No products were found!</p>
                    )
                  ) : (
                    <p>Loading...</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default Page;
