"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import Card from "@/components/Card";

const domain = process.env.DOMAIN;

export default function Suggestion() {
  const [hash, setHash] = useState<any>("");
  const url_param: any = useParams();
  const [products, setProducts] = useState<any>([]);

  useEffect(() => {
    setHash(url_param.slug);
    (async () => {
      const response = await axios.post(`/api/propagation/`, {
        id: hash === "" ? url_param.slug : hash,
        every: true,
      });
      const filteredProducts = response.data.filter(
        (product: any) => product.id !== url_param.slug
      );
      filteredProducts.sort(
        (a: any, b: any) => b.productStars - a.productStars
      );
      setProducts(filteredProducts);
    })();
  }, [hash, url_param.slug]);

  return (
    <div className="cards flex flex-wrap gap-x-5 gap-y-10 w-fit mx-auto">
      {products
        .slice(0, Math.min(5, products.length))
        .map((product: any, index: any) => (
          <Card
            key={index}
            id={product._id}
            src={product.productImages[0]}
            productName={product.productName}
            productPrice={product.productPrice}
            cancelledPrice={product.cancelledProductPrice}
            reviews={product.productReviews.length}
            stars={product.productStars}
            status={product.latest ? "new" : "old"}
          />
        ))}
    </div>
  );
}
