"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const logo = "/logo.png";

export default function SSOCallback() {
  const router = useRouter();

  useEffect(() => {
    // Set a timeout to redirect to home if callback takes too long
    const timeout = setTimeout(() => {
      router.push("/");
    }, 10000); // 10 seconds

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="mb-8"
        >
          <Image 
            src={logo} 
            alt="Nuvante Logo" 
            width={80} 
            height={80} 
            className="mx-auto"
          />
        </motion.div>
        
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-gray-900 mb-4"
        >
          Completing your sign-in...
        </motion.h1>
        
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-gray-600 mb-8"
        >
          Please wait while we set up your account
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center"
        >
          <div className="w-8 h-8 border-4 border-[#DB4444] border-t-transparent rounded-full animate-spin"></div>
        </motion.div>
      </motion.div>

      {/* Clerk's callback handler */}
      <AuthenticateWithRedirectCallback />
    </div>
  );
} 