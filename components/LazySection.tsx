"use client";
import React, { useState, useEffect, useRef, ReactNode } from 'react';
import SkeletonLoader from './SkeletonLoader';

interface LazySectionProps {
  children: ReactNode;
  fallback?: ReactNode;
  threshold?: number;
  rootMargin?: string;
  className?: string;
  skeletonType?: 'product' | 'hero' | 'text';
  skeletonCount?: number;
}

const LazySection: React.FC<LazySectionProps> = ({
  children,
  fallback,
  threshold = 0.1,
  rootMargin = '50px',
  className = '',
  skeletonType = 'product',
  skeletonCount = 4
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsVisible(true);
          // Add a small delay to make the loading feel more natural
          setTimeout(() => {
            setHasLoaded(true);
          }, 300);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [threshold, rootMargin, hasLoaded]);

  const defaultFallback = (
    <div className="space-y-6">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
        <SkeletonLoader 
          type={skeletonType} 
          count={skeletonCount} 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        />
      </div>
    </div>
  );

  return (
    <div ref={ref} className={className}>
      {hasLoaded ? (
        <div className="animate-fade-in">
          {children}
        </div>
      ) : isVisible ? (
        fallback || defaultFallback
      ) : (
        <div className="h-96 flex items-center justify-center">
          <div className="text-gray-400 text-sm">Loading section...</div>
        </div>
      )}
    </div>
  );
};

export default LazySection;

 