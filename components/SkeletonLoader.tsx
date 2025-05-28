import React from 'react';

interface SkeletonLoaderProps {
  type?: 'product' | 'hero' | 'text';
  count?: number;
  className?: string;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  type = 'product', 
  count = 1, 
  className = '' 
}) => {
  const renderProductSkeleton = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className="w-full aspect-square bg-gray-200"></div>
      
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Title skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        
        {/* Price skeleton */}
        <div className="flex items-center space-x-2">
          <div className="h-5 bg-gray-200 rounded w-16"></div>
          <div className="h-4 bg-gray-200 rounded w-12"></div>
        </div>
        
        {/* Rating skeleton */}
        <div className="flex items-center space-x-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-4 h-4 bg-gray-200 rounded"></div>
          ))}
          <div className="h-3 bg-gray-200 rounded w-8 ml-2"></div>
        </div>
        
        {/* Button skeleton */}
        <div className="h-10 bg-gray-200 rounded w-full"></div>
      </div>
    </div>
  );

  const renderHeroSkeleton = () => (
    <div className="w-full h-96 bg-gray-200 rounded-lg animate-pulse">
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <div className="h-8 bg-gray-300 rounded w-64 mx-auto"></div>
          <div className="h-4 bg-gray-300 rounded w-48 mx-auto"></div>
          <div className="h-10 bg-gray-300 rounded w-32 mx-auto"></div>
        </div>
      </div>
    </div>
  );

  const renderTextSkeleton = () => (
    <div className="animate-pulse space-y-2">
      <div className="h-4 bg-gray-200 rounded w-full"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      <div className="h-4 bg-gray-200 rounded w-4/6"></div>
    </div>
  );

  const renderSkeleton = () => {
    switch (type) {
      case 'hero':
        return renderHeroSkeleton();
      case 'text':
        return renderTextSkeleton();
      case 'product':
      default:
        return renderProductSkeleton();
    }
  };

  if (count === 1) {
    return <div className={className}>{renderSkeleton()}</div>;
  }

  return (
    <div className={`grid gap-4 ${className}`}>
      {[...Array(count)].map((_, index) => (
        <div key={index}>
          {renderSkeleton()}
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader; 