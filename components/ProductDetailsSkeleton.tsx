import React from 'react';

const ProductDetailsSkeleton = () => {
  return (
    <div className="animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Gallery Skeleton */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="aspect-square bg-gray-200 rounded-lg animate-shimmer"></div>
          
          {/* Thumbnail Images */}
          <div className="grid grid-cols-4 gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded-md animate-shimmer" style={{ animationDelay: `${i * 0.1}s` }}></div>
            ))}
          </div>
        </div>

        {/* Product Info Skeleton */}
        <div className="space-y-6">
          {/* Breadcrumb */}
          <div className="flex space-x-2">
            <div className="h-4 bg-gray-200 rounded w-16 animate-shimmer"></div>
            <div className="h-4 bg-gray-200 rounded w-4 animate-shimmer" style={{ animationDelay: '0.1s' }}></div>
            <div className="h-4 bg-gray-200 rounded w-20 animate-shimmer" style={{ animationDelay: '0.2s' }}></div>
          </div>

          {/* Product Title */}
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 rounded w-3/4 animate-shimmer"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 animate-shimmer" style={{ animationDelay: '0.1s' }}></div>
          </div>

          {/* Price */}
          <div className="flex items-center space-x-4">
            <div className="h-8 bg-gray-200 rounded w-24 animate-shimmer"></div>
            <div className="h-6 bg-gray-200 rounded w-20 animate-shimmer" style={{ animationDelay: '0.1s' }}></div>
          </div>

          {/* Rating */}
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-5 h-5 bg-gray-200 rounded animate-shimmer" style={{ animationDelay: `${i * 0.05}s` }}></div>
              ))}
            </div>
            <div className="h-4 bg-gray-200 rounded w-16 animate-shimmer" style={{ animationDelay: '0.3s' }}></div>
          </div>

          {/* Size/Quantity */}
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-16 animate-shimmer"></div>
            <div className="flex space-x-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 w-10 bg-gray-200 rounded animate-shimmer" style={{ animationDelay: `${i * 0.1}s` }}></div>
              ))}
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="space-y-2">
            <div className="h-6 bg-gray-200 rounded w-20 animate-shimmer"></div>
            <div className="h-10 bg-gray-200 rounded w-32 animate-shimmer" style={{ animationDelay: '0.1s' }}></div>
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <div className="h-12 bg-gray-200 rounded w-full animate-shimmer"></div>
            <div className="h-12 bg-gray-200 rounded w-full animate-shimmer" style={{ animationDelay: '0.1s' }}></div>
          </div>

          {/* Product Details Sections */}
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="border-b border-gray-200 pb-4">
                <div className="h-6 bg-gray-200 rounded w-40 mb-2 animate-shimmer" style={{ animationDelay: `${i * 0.1}s` }}></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full animate-shimmer" style={{ animationDelay: `${i * 0.1 + 0.05}s` }}></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6 animate-shimmer" style={{ animationDelay: `${i * 0.1 + 0.1}s` }}></div>
                  <div className="h-4 bg-gray-200 rounded w-4/6 animate-shimmer" style={{ animationDelay: `${i * 0.1 + 0.15}s` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsSkeleton; 