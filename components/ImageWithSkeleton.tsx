"use client";
import React, { useState } from 'react';
import Image from 'next/image';

interface ImageWithSkeletonProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
  onLoad?: () => void;
  skeletonClassName?: string;
}

const ImageWithSkeleton: React.FC<ImageWithSkeletonProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  fill = false,
  sizes,
  onLoad,
  skeletonClassName = ''
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const skeletonClasses = `
    animate-pulse bg-gray-200 
    ${fill ? 'absolute inset-0' : `w-${width} h-${height}`}
    ${skeletonClassName}
  `;

  const imageClasses = `
    transition-opacity duration-300
    ${isLoading ? 'opacity-0' : 'opacity-100'}
    ${className}
  `;

  return (
    <div className={`relative ${fill ? 'w-full h-full' : ''}`}>
      {/* Skeleton loader */}
      {isLoading && !hasError && (
        <div className={skeletonClasses}>
          <div className="w-full h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse">
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 text-gray-400">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <div className={`bg-gray-100 flex items-center justify-center ${fill ? 'absolute inset-0' : `w-${width} h-${height}`}`}>
          <div className="text-center text-gray-400">
            <div className="w-8 h-8 mx-auto mb-2">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-xs">Failed to load</p>
          </div>
        </div>
      )}

      {/* Actual image */}
      {!hasError && (
        <Image
          src={src}
          alt={alt}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          fill={fill}
          sizes={sizes}
          priority={priority}
          className={imageClasses}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  );
};

export default ImageWithSkeleton; 