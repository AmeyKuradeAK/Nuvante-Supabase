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
    <div className="embla">
      <div className="embla__container">
        {sliderImages.map((image, index) => (
          <div key={index} className="embla__slide">
            <img
              className="lg:h-[100vh] h-[40vh]"
              src={image.src}
              alt={`Slide ${index + 1}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
