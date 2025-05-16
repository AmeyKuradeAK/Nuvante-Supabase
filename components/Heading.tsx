import React from "react";

type propType = {
  message: string;
  secondaryMessage: string;
};

export default function Heading({ message, secondaryMessage }: propType) {
  return (
    <>
      <div className="text-black text-3xl w-fit mx-auto font-bold 2xl:text-5xl xl:text-4xl">
        {secondaryMessage}
      </div>
    </>
  );
}
