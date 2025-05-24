"use client";
import React, { useState } from "react";
import { useAuth, useSignIn } from "@clerk/nextjs";
import type { NextPage } from "next";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useClerk } from "@clerk/nextjs";
import { useAlert } from "@/context/AlertContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

const ForgotPasswordPage: NextPage = () => {
  const { signOut } = useClerk();
  const { showAlert } = useAlert();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [successfulCreation, setSuccessfulCreation] = useState(false);
  const [secondFactor, setSecondFactor] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { isLoaded, signIn, setActive } = useSignIn();

  if (!isLoaded) {
    return null;
  }

  if (isSignedIn) {
    router.push("/");
    return null;
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signIn?.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });
      setSuccessfulCreation(true);
      showAlert("Reset code sent to your email", "success");
    } catch (err: any) {
      console.error("Error sending reset code:", err);
      showAlert(err.errors[0].longMessage || "Error sending reset code", "error");
    } finally {
      setIsLoading(false);
    }
  }

  async function reset(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await signIn?.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password,
      });

      if (result?.status === "needs_second_factor") {
        setSecondFactor(true);
        showAlert("2FA is required", "warning");
      } else if (result?.status === "complete") {
        try {
          await axios.post("/api/populate/", {
            firstName: "existing",
            lastName: "existing",
            password: password,
            address: "existing",
            email: email,
          });
          
          if (setActive && result.createdSessionId) {
            await setActive({ session: result.createdSessionId });
            showAlert("Password reset successful!", "success");
            router.push("/Profile");
          } else {
            throw new Error("Failed to set active session");
          }
        } catch (error) {
          console.error("Error updating database:", error);
          await signOut({ redirectUrl: "/sign-up" });
        }
      }
    } catch (err: any) {
      console.error("Error resetting password:", err);
      showAlert(err.errors[0].longMessage || "Error resetting password", "error");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
                <p className="text-gray-600">
                  {!successfulCreation 
                    ? "Enter your email to receive a reset code"
                    : "Enter the reset code and your new password"}
                </p>
              </div>

              <form onSubmit={!successfulCreation ? create : reset} className="space-y-6">
                {!successfulCreation ? (
                  <>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DB4444] focus:border-[#DB4444] transition-all"
                        placeholder="Enter your email"
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
                          Sending code...
                        </>
                      ) : (
                        "Send Reset Code"
                      )}
                    </button>
                  </>
                ) : (
                  <>
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                      </label>
                      <input
                        id="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DB4444] focus:border-[#DB4444] transition-all"
                        placeholder="Enter new password"
                      />
                    </div>

                    <div>
                      <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                        Reset Code
                      </label>
                      <input
                        id="code"
                        type="text"
                        required
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DB4444] focus:border-[#DB4444] transition-all"
                        placeholder="Enter reset code"
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
                          Resetting password...
                        </>
                      ) : (
                        "Reset Password"
                      )}
                    </button>
                  </>
                )}

                {secondFactor && (
                  <p className="text-sm text-red-500 text-center">
                    2FA is required for this account. Please contact support.
                  </p>
                )}
              </form>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ForgotPasswordPage;
