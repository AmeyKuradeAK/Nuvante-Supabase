"use client";
import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { attemptOrderRecovery, clearOldFailedOrders } from '@/utils/orderRecovery';

export default function OrderRecoveryHandler() {
  const { isSignedIn, isLoaded } = useUser();

  useEffect(() => {
    // Only run on client side and after user data is loaded
    if (typeof window === 'undefined' || !isLoaded) return;

    const handleOrderRecovery = async () => {
      try {
        // Clear old failed orders first (older than 7 days)
        clearOldFailedOrders();

        // Only attempt recovery if user is signed in
        if (isSignedIn) {
          // Add a small delay to ensure everything is loaded
          setTimeout(() => {
            attemptOrderRecovery();
          }, 2000);
        }
      } catch (error) {
        console.error('Error in order recovery handler:', error);
      }
    };

    handleOrderRecovery();
  }, [isSignedIn, isLoaded]);

  // This component doesn't render anything
  return null;
} 