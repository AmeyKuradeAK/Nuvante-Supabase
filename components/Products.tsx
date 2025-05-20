import React from "react";
import Heading from "./Heading";
import Card from "./Card";
import Button from "./button";
import Link from "next/link";

type mainProp = {
  fragment: {
    id: any;
    productName: string;
    productImages: string;
    productPrice: string;
    cancelledProductPrice: string;
    latest: boolean;
  }[];
};

export default function Products({ fragment }: mainProp) {
  return (
    <div className="mt-12 flex flex-col gap-8">
      <div className="flex w-full justify-between items-center">
        <Heading message="Products" secondaryMessage="ALL PRODUCTS" />
      </div>
      <div className="flex flex-col gap-8 mx-auto w-full px-4 md:px-6 lg:px-8">
        <div className="cards grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
          {fragment.map((product, index) => (
            <Card
              key={index}
              id={product.id}
              productName={product.productName}
              productPrice={Number(product.productPrice)}
              cancelledPrice={Number(product.cancelledProductPrice)}
              src={product.productImages[0]}
              status={product.latest ? "new" : "old"}
            />
          ))}
        </div>
        <Link href="/Products" className="w-fit mx-auto">
          <Button text="View All Products" width={220} />
        </Link>
      </div>
    </div>
  );
}
