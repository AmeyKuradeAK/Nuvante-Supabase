"use client";
import React, { useEffect } from "react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import Link from "next/link";
import { useSignIn } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useAlert } from "@/context/AlertContext";
import { motion } from "framer-motion";

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
  const searchParams = useSearchParams();

  useEffect(() => {
    if (user.isSignedIn) {
      const redirectUrl = searchParams?.get('redirect_url') || '/';
      router.push(redirectUrl);
    }
  }, [user.isSignedIn, router, searchParams]);

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
        showAlert("Successfully signed in!", "success");
        const redirectUrl = searchParams?.get('redirect_url') || '/';
        router.push(redirectUrl);
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

  const handleGoogleSignIn = async () => {
    if (!isLoaded) return;

    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: searchParams?.get('redirect_url') || "/",
      });
    } catch (err: any) {
      console.error(err);
      showAlert("Error signing in with Google", "error");
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
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <Image
                    src={sideImg}
                    alt="side-image"
                    height={600}
                    width={800}
                    className="rounded-2xl shadow-xl"
                  />
                </motion.div>
              </motion.div>

              {/* Right Side - Form */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-full lg:w-1/2 max-w-md mx-auto"
              >
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-center mb-8"
                >
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
                  <p className="text-gray-600">Sign in to access your account</p>
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white p-8 rounded-2xl shadow-xl"
                >
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Social Sign In Buttons - Priority */}
                    <div className="grid grid-cols-1 gap-3">
                      {/* Google Sign In Button */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                        className="w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium"
                      >
                        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Continue with Google
                      </motion.button>
                    </div>

                    {/* Divider */}
                    <motion.div 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="relative my-6"
                    >
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">Or sign in with email</span>
                      </div>
                    </motion.div>

                    {/* Email/Password Fields */}
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
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
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DB4444] focus:border-[#DB4444] transition-all"
                        placeholder="Enter your email"
                      />
                    </motion.div>

                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
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
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DB4444] focus:border-[#DB4444] transition-all"
                        placeholder="Enter your password"
                      />
                    </motion.div>

                    <motion.div 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="flex items-center justify-end"
                    >
                      <Link
                        href="/forgot"
                        className="text-sm text-[#DB4444] hover:text-[#c13a3a] transition-colors"
                      >
                        Forgot password?
                      </Link>
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
                          Signing in...
                        </motion.div>
                      ) : (
                        "Sign In"
                      )}
                    </motion.button>

                    <motion.div 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="text-center mt-6"
                    >
                      <p className="text-gray-600">
                        Don't have an account?{" "}
                        <Link href="/sign-up" className="text-[#DB4444] hover:text-[#c13a3a] transition-colors font-medium">
                          Sign Up
                        </Link>
                      </p>
                    </motion.div>
                  </form>
                </motion.div>
              </motion.div>
            </div>
          </div>
          <Footer />
        </>
      )}

      {user.isSignedIn && (
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
      )}
    </div>
  );
};

export default page;
