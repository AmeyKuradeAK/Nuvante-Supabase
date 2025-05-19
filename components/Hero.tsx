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
    <div className="w-full">
      <div className="w-full">
        <EmblaCarousel />
      </div>
    </div>
  );
}
