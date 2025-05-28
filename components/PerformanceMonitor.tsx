"use client";
import { useEffect } from 'react';

interface PerformanceMonitorProps {
  componentName: string;
  onLoadTime?: (time: number) => void;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ 
  componentName, 
  onLoadTime 
}) => {
  useEffect(() => {
    const startTime = performance.now();
    
    // Monitor when component is fully loaded
    const observer = new MutationObserver(() => {
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`${componentName} loaded in ${loadTime.toFixed(2)}ms`);
      }
      
      onLoadTime?.(loadTime);
      observer.disconnect();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Cleanup after 5 seconds
    const timeout = setTimeout(() => {
      observer.disconnect();
    }, 5000);

    return () => {
      observer.disconnect();
      clearTimeout(timeout);
    };
  }, [componentName, onLoadTime]);

  return null;
};

// Hook for measuring component render time
export const usePerformanceMetrics = (componentName: string) => {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`${componentName} render time: ${renderTime.toFixed(2)}ms`);
      }
    };
  }, [componentName]);
};

// Function to measure API call performance
export const measureApiCall = async <T,>(
  apiCall: () => Promise<T>,
  apiName: string
): Promise<T> => {
  const startTime = performance.now();
  
  try {
    const result = await apiCall();
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`API ${apiName} completed in ${duration.toFixed(2)}ms`);
    }
    
    return result;
  } catch (error) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    if (process.env.NODE_ENV === 'development') {
      console.error(`API ${apiName} failed after ${duration.toFixed(2)}ms:`, error);
    }
    
    throw error;
  }
};

export default PerformanceMonitor; 