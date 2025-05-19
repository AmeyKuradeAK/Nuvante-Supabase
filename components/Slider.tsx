import React, { useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

const domain = process.env.DOMAIN;

const sliderImages = [
  {
    src: "./nuvante_web.jpg",
    link: `/ProductDetails/67630548e9a7266a1f0b3533`,
  },
  {
    src: "./nuvante_web.jpg",
    link: `/ProductDetails/67630548e9a7266a1f0b3533`,
  },
];

export function EmblaCarousel() {
  return (
    <div className="embla w-full">
      <div className="embla__container">
        {sliderImages.map((image, index) => (
          <div key={index} className="embla__slide w-full">
            <div className="relative w-full aspect-[16/9] md:aspect-[21/9] lg:aspect-[21/9]">
              <img
                className="w-full h-full object-cover"
                src={image.src}
                alt={`Slide ${index + 1}`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
