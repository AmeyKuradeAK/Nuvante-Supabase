"use client";
import React from "react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import Link from "next/link";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useAlert } from "@/context/AlertContext";
import { motion } from "framer-motion";
import axios from "axios";

// Move static assets outside component
const sideImg = "/Side-Image.jpg";

// Memoize the form component
const SignUpForm = React.memo(({ onSubmit, isLoading }: { onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>, isLoading: boolean }) => (
  <form onSubmit={onSubmit} className="space-y-6">
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.1 }}
    >
      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
        Full Name
      </label>
      <motion.input
        whileFocus={{ scale: 1.01 }}
        id="name"
        name="name"
        type="text"
        required
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DB4444] focus:border-[#DB4444] transition-all"
        placeholder="Enter your full name"
      />
    </motion.div>

    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
        Email
      </label>
      <motion.input
        whileFocus={{ scale: 1.01 }}
        id="email"
        name="email"
        type="email"
        required
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DB4444] focus:border-[#DB4444] transition-all"
        placeholder="Enter your email"
      />
    </motion.div>

    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.25 }}
    >
      <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700 mb-1">
        Mobile Number
      </label>
      <motion.input
        whileFocus={{ scale: 1.01 }}
        id="mobileNumber"
        name="mobileNumber"
        type="tel"
        required
        pattern="[0-9]{10}"
        maxLength={10}
        minLength={10}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DB4444] focus:border-[#DB4444] transition-all"
        placeholder="Enter your 10-digit mobile number"
      />
      <p className="text-xs text-gray-500 mt-1">Please enter a valid 10-digit mobile number</p>
    </motion.div>

    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
        Password
      </label>
      <motion.input
        whileFocus={{ scale: 1.01 }}
        id="password"
        name="password"
        type="password"
        required
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DB4444] focus:border-[#DB4444] transition-all"
        placeholder="Create a password"
      />
    </motion.div>

    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      type="submit"
      disabled={isLoading}
      className="w-full bg-[#DB4444] text-white py-3 px-4 rounded-lg hover:bg-[#c13a3a] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium"
    >
      {isLoading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center"
        >
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Creating account...
        </motion.div>
      ) : (
        "Create Account"
      )}
    </motion.button>

    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4 }}
      className="text-center mt-6"
    >
      <p className="text-gray-600">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-[#DB4444] hover:text-[#c13a3a] transition-colors font-medium">
          Sign In
        </Link>
      </p>
    </motion.div>
  </form>
));

SignUpForm.displayName = 'SignUpForm';

interface ProfileResponse {
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  cart: string[];
  wishlist: string[];
  orders: any[];
}

const SignUpPage = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();
  const { showAlert } = useAlert();
  const [isLoading, setIsLoading] = React.useState(false);
  const user = useUser();

  const handleSubmit = React.useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isLoaded) return;

    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("name") as string;
    const mobileNumber = formData.get("mobileNumber") as string;

    // Validate mobile number
    if (!/^[0-9]{10}$/.test(mobileNumber)) {
      showAlert("Please enter a valid 10-digit mobile number", "error");
      setIsLoading(false);
      return;
    }

    // Split full name into first and last name
    const nameParts = fullName.trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    try {
      const signUpAttempt = await signUp.create({
        emailAddress: email,
        password,
      });

      if (signUpAttempt.status === "missing_requirements") {
        await signUpAttempt.prepareEmailAddressVerification();
        showAlert("Please check your email for a verification code", "info");
        router.push("/verify");
        return;
      }

      // Update Clerk user profile with full name
      await signUpAttempt.update({
        firstName,
        lastName,
      });

      await setActive({ session: signUpAttempt.createdSessionId });

      try {
        // Wait for Clerk session to be fully established
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Create client record with proper name fields and email
        const response = await axios.post("/api/populate/", {
          firstName,
          lastName,
          password,
          email,
          mobileNumber,
          cart: [],
          wishlist: [],
          cartQuantities: new Map(),
          cartSizes: new Map(),
          orders: []
        });

        if (response.status !== 200) {
          throw new Error("Failed to save profile data");
        }

        // Wait for database to update
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Verify the data was saved by fetching it
        const profileResponse = await axios.get<ProfileResponse>("/api/propagation_client");
        if (!profileResponse.data.firstName || !profileResponse.data.lastName || !profileResponse.data.email || !profileResponse.data.mobileNumber) {
          throw new Error("Profile data not properly saved");
        }

        // Double check the data matches what we sent
        if (profileResponse.data.firstName !== firstName || 
            profileResponse.data.lastName !== lastName || 
            profileResponse.data.email !== email || 
            profileResponse.data.mobileNumber !== mobileNumber) {
          throw new Error("Profile data mismatch");
        }

        showAlert("Account created successfully!", "success");
        router.push("/");
      } catch (error) {
        console.error("Error populating database:", error);
        showAlert("Account created but database population failed. Please try updating your profile.", "warning");
        router.push("/profile");
      }
    } catch (error: any) {
      console.error("Error during sign up:", error);
      showAlert(error.message || "Something went wrong", "error");
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, signUp, setActive, router, showAlert]);

  if (user.isSignedIn) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen flex items-center justify-center"
      >
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">You are already signed in</h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/")}
            className="text-[#DB4444] hover:text-[#c13a3a] transition-colors"
          >
            Go to Home
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full lg:w-1/2"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <Image
                src={sideImg}
                alt="side-image"
                height={600}
                width={800}
                className="rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300"
                priority
                quality={75}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full lg:w-1/2 max-w-md"
          >
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300"
            >
              <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-center mb-8"
              >
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
                <p className="text-gray-600">Join Nuvante today</p>
              </motion.div>
              <SignUpForm onSubmit={handleSubmit} isLoading={isLoading} />
            </motion.div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SignUpPage;
