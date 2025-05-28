"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface ProductCarouselProps {
  images: string[];
  onImagesLoaded?: () => void;
}

const ProductCarousel: React.FC<ProductCarouselProps> = ({ images, onImagesLoaded }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  // Track image loading
  const handleImageLoad = useCallback((index: number) => {
    setLoadedImages(prev => {
      const newSet = new Set(prev);
      newSet.add(index);
      
      // If all images are loaded, call the callback
      if (newSet.size === images.length && onImagesLoaded) {
        setTimeout(() => onImagesLoaded(), 100); // Small delay to ensure smooth transition
      }
      
      return newSet;
    });
  }, [images.length, onImagesLoaded]);

  // Reset loaded images when images prop changes
  useEffect(() => {
    setLoadedImages(new Set());
  }, [images]);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  }, [images.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  }, [images.length]);

  const selectSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 5 seconds of inactivity
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextSlide();
    }
    if (isRightSwipe) {
      prevSlide();
    }

    setTouchEnd(null);
    setTouchStart(null);
  };

  // Auto-scroll effect
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-4 w-full max-w-[1920px] mx-auto">
      {/* Thumbnails - Horizontal on mobile, vertical on desktop */}
      <div className="flex lg:flex-col gap-2 lg:w-[120px] px-4 lg:px-0">
        {/* Mobile Thumbnails - Horizontally centered and scrollable */}
        <div className="flex lg:hidden gap-2 overflow-x-auto w-full justify-center scrollbar-hide">
          {images.map((image, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`relative w-20 h-20 flex-shrink-0 cursor-pointer border-2 transition-all duration-300 ${
                currentIndex === index 
                  ? 'border-black scale-105' 
                  : 'border-transparent hover:border-gray-300'
              }`}
              onClick={() => selectSlide(index)}
            >
              <Image
                src={image}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-contain animate-image-load"
                onLoad={() => handleImageLoad(index)}
              />
            </motion.div>
          ))}
        </div>

        {/* Desktop Thumbnails - Vertical and fixed */}
        <div className="hidden lg:flex lg:flex-col gap-2">
          {images.map((image, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`relative w-full aspect-square cursor-pointer border-2 transition-all duration-300 ${
                currentIndex === index 
                  ? 'border-black scale-105' 
                  : 'border-transparent hover:border-gray-300'
              }`}
              onClick={() => selectSlide(index)}
            >
              <Image
                src={image}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-contain animate-image-load"
                onLoad={() => handleImageLoad(index)}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Main Image Carousel */}
      <div className="relative w-screen lg:w-[calc(100%-140px)] -mx-4 lg:mx-0">
        <div 
          className="relative w-full h-[400px] sm:h-[500px] md:h-[600px] lg:h-[650px] xl:h-[700px] 2xl:h-[800px]"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <Image
            src={images[currentIndex]}
            alt={`Product image ${currentIndex + 1}`}
            fill
            className="object-contain animate-image-load"
            priority={currentIndex === 0}
            sizes="100vw"
            onLoad={() => handleImageLoad(currentIndex)}
          />
        </div>

        {/* Navigation Buttons - Hidden on mobile */}
        <button
          onClick={() => {
            prevSlide();
            setIsAutoPlaying(false);
            setTimeout(() => setIsAutoPlaying(true), 5000);
          }}
          className="hidden lg:block absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md hover:bg-white transition-all duration-300 hover:scale-110"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <button
          onClick={() => {
            nextSlide();
            setIsAutoPlaying(false);
            setTimeout(() => setIsAutoPlaying(true), 5000);
          }}
          className="hidden lg:block absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md hover:bg-white transition-all duration-300 hover:scale-110"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ProductCarousel; 