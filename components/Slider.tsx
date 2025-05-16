import React, { useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

const domain = process.env.DOMAIN;

const sliderImages = [
  {
    src: "https://cdn.jsdelivr.net/gh/AmeyKuradeAK/nuvante-cdn/Image/nuvante_web.jpg",
    link: `/ProductDetails/67630548e9a7266a1f0b3533`,
  },
  {
    src: "https://cdn.jsdelivr.net/gh/AmeyKuradeAK/nuvante-cdn/Image/nuvante_web.jpg",
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
              className="lg:h-[90vh] md:h-[80vh] xl:h-[95vh] 2xl:h-[90vh] h-[50vh]"
              src={image.src}
              alt={`Slide ${index + 1}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
