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
    <div>
      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
        Full Name
      </label>
      <input
        id="name"
        name="name"
        type="text"
        required
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DB4444] focus:border-[#DB4444] transition-all"
        placeholder="Enter your full name"
      />
    </div>

    <div>
      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
        Email
      </label>
      <input
        id="email"
        name="email"
        type="email"
        required
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DB4444] focus:border-[#DB4444] transition-all"
        placeholder="Enter your email"
      />
    </div>

    <div>
      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
        Password
      </label>
      <input
        id="password"
        name="password"
        type="password"
        required
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DB4444] focus:border-[#DB4444] transition-all"
        placeholder="Create a password"
      />
    </div>

    <button
      type="submit"
      disabled={isLoading}
      className="w-full bg-[#DB4444] text-white py-3 px-4 rounded-lg hover:bg-[#c13a3a] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium"
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Creating account...
        </>
      ) : (
        "Create Account"
      )}
    </button>

    <div className="text-center mt-6">
      <p className="text-gray-600">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-[#DB4444] hover:text-[#c13a3a] transition-colors font-medium">
          Sign In
        </Link>
      </p>
    </div>
  </form>
));

SignUpForm.displayName = 'SignUpForm';

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
    const name = formData.get("name") as string;

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

      await signUpAttempt.update({
        firstName: name,
      });

      await setActive({ session: signUpAttempt.createdSessionId });

      try {
        await axios.post("/api/populate/", {
          firstName: name,
          lastName: "",
          password,
          email,
          address: "Default Address",
        });
        showAlert("Account created successfully!", "success");
        router.push("/");
      } catch (error) {
        console.error("Error populating database:", error);
        showAlert("Account created but database population failed", "warning");
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">You are already signed in</h1>
          <button
            onClick={() => router.push("/")}
            className="text-[#DB4444] hover:text-[#c13a3a] transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
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
            <Image
              src={sideImg}
              alt="side-image"
              height={600}
              width={800}
              className="rounded-2xl shadow-xl"
              priority
              quality={75}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full lg:w-1/2 max-w-md"
          >
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
                <p className="text-gray-600">Join Nuvante today</p>
              </div>
              <SignUpForm onSubmit={handleSubmit} isLoading={isLoading} />
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SignUpPage;
