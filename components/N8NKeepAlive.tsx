"use client";

import { useEffect, useState } from 'react';
import n8nKeepAlive from '@/utils/n8n-keepalive';

interface N8NStatus {
  isRunning: boolean;
  failureCount: number;
  lastSuccessTime: number;
  timeSinceLastSuccess: number;
}

export default function N8NKeepAlive() {
  const [status, setStatus] = useState<N8NStatus | null>(null);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    // The utility auto-starts, but we can ensure it's running
    if (typeof window !== 'undefined') {
      // Update status every 10 seconds
      const statusInterval = setInterval(() => {
        const currentStatus = n8nKeepAlive.getStatus();
        setStatus(currentStatus);
      }, 10000);

      // Initial status check
      setTimeout(() => {
        const currentStatus = n8nKeepAlive.getStatus();
        setStatus(currentStatus);
      }, 3000);

      return () => {
        clearInterval(statusInterval);
      };
    }
  }, []);

  // Only show in development or when there are issues
  const shouldShowStatus = process.env.NODE_ENV === 'development' || 
                          (status && (status.failureCount > 0 || !status.isRunning));

  if (!shouldShowStatus || !status) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Status indicator */}
      <div 
        className={`
          w-3 h-3 rounded-full cursor-pointer transition-all duration-300
          ${status.isRunning && status.failureCount === 0 
            ? 'bg-green-500 animate-pulse' 
            : status.failureCount > 0 
            ? 'bg-yellow-500 animate-bounce' 
            : 'bg-red-500'
          }
        `}
        onClick={() => setShowStatus(!showStatus)}
        title="N8N Keep-Alive Status"
      />

      {/* Detailed status panel */}
      {showStatus && (
        <div className="absolute bottom-6 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-64 text-xs">
          <div className="font-semibold text-gray-800 mb-2 flex items-center justify-between">
            <span>N8N Keep-Alive Status</span>
            <button 
              onClick={() => setShowStatus(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-1 text-gray-600">
            <div className="flex justify-between">
              <span>Status:</span>
              <span className={`font-medium ${
                status.isRunning ? 'text-green-600' : 'text-red-600'
              }`}>
                {status.isRunning ? 'Running' : 'Stopped'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>Failures:</span>
              <span className={`font-medium ${
                status.failureCount === 0 ? 'text-green-600' : 
                status.failureCount < 3 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {status.failureCount}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>Last Success:</span>
              <span className="font-medium text-gray-800">
                {Math.floor(status.timeSinceLastSuccess / 1000)}s ago
              </span>
            </div>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <div className="mt-2 pt-2 border-t border-gray-100">
              <div className="text-xs text-gray-500">
                Pinging every 8s to keep N8N alive
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 