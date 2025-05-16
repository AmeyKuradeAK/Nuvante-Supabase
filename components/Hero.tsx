"use client";
import React from "react";
import Image from "next/image";
import { EmblaCarousel } from "./Slider";

const caretRight = "./caret-right.svg";

/**
 * Hero section with a carousel from Embla.
 * Read More: https://www.embla-carousel.com/
 * TODO: add switches to the carousel. (when required)
 */

export default function Hero() {
  return (
    <>
      <div className="flex gap-1 justify-center md:flex-row flex-col items-center md:items-start">
        {/* <div className="flex md:flex-col w-[100%] gap-6 md:w-[20%] hero_left pt-10"> */}
        {/* <div className="flex gap-4 text-black cursor-pointer w-fit">
            <a href="#">Nuvante Originals</a>
            <Image
              src={caretRight}
              alt="dropdown"
              width={20}
              height={20}
            ></Image>
          </div>
          <div className="flex gap-4 text-black cursor-pointer w-fit">
            <a href="#"> T Shirts</a>
            <Image
              src={caretRight}
              alt="dropdown"
              width={20}
              height={20}
            ></Image>
          </div> */}
        {/* </div> */}
        <div className="w-[100%] lg:h-[100vh] h-[40vh] lg:w-[100%]">
          <EmblaCarousel></EmblaCarousel>
        </div>
      </div>
    </>
  );
}
