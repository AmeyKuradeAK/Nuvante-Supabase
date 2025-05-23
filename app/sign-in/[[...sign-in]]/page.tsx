"use client";
import React from "react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import Link from "next/link";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useAlert } from "@/context/AlertContext";
import { motion } from "framer-motion";
import axios from "axios";

const sideImg = "/Side-Image.jpg";

type Props = {};

const page = (props: Props) => {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();
  const user = useUser();
  const { showAlert } = useAlert();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setIsLoading(true);
    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        
        // Create client record for new users
        try {
          await axios.post("/api/populate/", {
            firstName: user.user?.firstName || "User",
            lastName: user.user?.lastName || "User",
            password: "clerk-auth", // Since we're using Clerk for auth
            email: email,
            address: "Address not provided",
          });
        } catch (error) {
          console.error("Error creating client record:", error);
          // Don't show error to user since this is a background operation
        }

        showAlert("Successfully signed in!", "success");
        router.push("/");
      } else {
        console.error(JSON.stringify(result, null, 2));
        showAlert("Sign in process incomplete", "error");
      }
    } catch (err: any) {
      console.error(err);
      showAlert(err.errors[0].message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {!user.isSignedIn && (
        <>
          <Navbar />
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
              {/* Left Side - Image */}
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
                />
              </motion.div>

              {/* Right Side - Form */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-full lg:w-1/2 max-w-md"
              >
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
                    <p className="text-gray-600">Sign in to your account</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DB4444] focus:border-[#DB4444] transition-all"
                        placeholder="Enter your password"
                      />
                    </div>

                    <div className="flex items-center justify-end">
                      <Link
                        href="/forgot-password"
                        className="text-sm text-[#DB4444] hover:text-[#c13a3a] transition-colors"
                      >
                        Forgot password?
                      </Link>
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
                          Signing in...
                        </>
                      ) : (
                        "Sign In"
                      )}
                    </button>

                    <div className="text-center mt-6">
                      <p className="text-gray-600">
                        Don't have an account?{" "}
                        <Link href="/sign-up" className="text-[#DB4444] hover:text-[#c13a3a] transition-colors font-medium">
                          Sign Up
                        </Link>
                      </p>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          </div>
          <Footer />
        </>
      )}

      {user.isSignedIn && (
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
      )}
    </div>
  );
};

export default page;
