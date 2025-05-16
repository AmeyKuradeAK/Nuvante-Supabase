import React from "react";
import Image from "next/image";

const caret = "/caret.svg";

export default function Header() {
  return (
    <>
      <div className="bg-black">
        <div className="bg-black w-[87%] py-2.5 mx-auto flex gap-2 justify-end">
          <a href="#" className="text-white">
            English{" "}
          </a>
          <Image
            src={caret}
            alt="dropdown"
            className="cursor-pointer"
            width={20}
            height={20}
          ></Image>
        </div>
      </div>
    </>
  );
}
