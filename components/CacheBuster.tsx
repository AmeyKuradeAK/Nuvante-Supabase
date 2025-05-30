"use client";

import React, { useEffect, useState } from 'react';
import { useAlert } from '@/context/AlertContext';

const CacheBuster = () => {
  const { showAlert } = useAlert();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const clearAllCache = async () => {
    try {
      showAlert('Clearing cache and refreshing...', 'info');

      // Clear all browser caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }

      // Clear service worker cache
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        registrations.forEach(registration => {
          registration.update();
        });
      }

      // Clear localStorage (except essential items)
      const essentialKeys = ['clerk-session', 'clerk-db-jwt', 'clerk-'];
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (!essentialKeys.some(essential => key.includes(essential))) {
          localStorage.removeItem(key);
        }
      });

      // Clear sessionStorage
      sessionStorage.clear();

      // Update app version to force refresh
      localStorage.setItem('nuvante-app-version', Date.now().toString());

      // Wait a moment then reload
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error) {
      console.error('Error clearing cache:', error);
      showAlert('Error clearing cache. Please refresh manually.', 'error');
    }
  };

  // Check if user is experiencing cache issues
  const hasIssues = () => {
    if (!isMounted || typeof window === 'undefined') return false;
    
    // Check if localStorage has old data
    const version = localStorage.getItem('nuvante-app-version');
    return !version || version < "2024122901";
  };

  if (!isMounted || !hasIssues()) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg max-w-sm">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Cart/Wishlist Issues?
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>If you're experiencing problems with cart or wishlist functionality, clear your cache.</p>
            </div>
            <div className="mt-4">
              <button
                type="button"
                onClick={clearAllCache}
                className="bg-yellow-50 text-yellow-800 rounded-md text-sm font-medium px-3 py-2 hover:bg-yellow-100 border border-yellow-300 transition-colors duration-200"
              >
                Clear Cache & Refresh
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CacheBuster; 