import React from "react";
import Heading from "./Heading";
import Card from "./Card";
import Button from "./button";
import Link from "next/link";

type mainProp = {
  fragment: {
    _id: any;
    productName: string;
    productImages: string;
    productPrice: string;
    cancelledProductPrice: string;
    latest: boolean;
  }[];
};

export default function Arrivals({ fragment }: mainProp) {
  //* custom comparator function for sort(a, b).
  //* used it later in the code. at 42.
  return (
    <>
      <div className="mt-12 flex flex-col gap-8">
        <div className="flex w-full justify-between items-center">
          <Heading
            message="Newest Arrivals"
            secondaryMessage="Nuvante's Atelier"
          ></Heading>
          {/* <Link href="/Products">
            <Button text="View All" width={130}></Button>
          </Link> */}
        </div>
        <div className="flex flex-col gap-8 w-full px-4 md:px-6 lg:px-8">
          <div className="cards grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
            {fragment.map((product, index) => (
              <Card
                id={product._id}
                key={index}
                productName={product.productName}
                productPrice={Number(product.productPrice)}
                cancelledPrice={Number(product.cancelledProductPrice)}
                src={product.productImages[0]}
                status={product.latest ? "new" : "old"}
              ></Card>
            ))}
          </div>
          <Link href="/Products" className="mx-auto w-fit">
            <Button text="View All Products" width={220}></Button>
          </Link>
        </div>
      </div>
    </>
  );
}
