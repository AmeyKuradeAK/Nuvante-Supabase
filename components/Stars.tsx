import React from "react";

const domain = process.env.NEXT_PUBLIC_DOMAIN;

const filled_star = `/filled_star.svg`;
const unfilled_star = `/unfilled_star.svg`;

export default function Stars({ count }: { count: number }) {
  const dummy = new Array(5);
  for (let i = 0; i < 5; ++i) {
    dummy[i] = count - i - 1 >= 0 ? true : false;
  }
  return (
    <div className="flex">
      {dummy.map((element, index) => (
        <img
          key={index}
          src={element ? filled_star : unfilled_star}
          alt={element ? "Filled star" : "Unfilled star"}
        />
      ))}
    </div>
  );
}
