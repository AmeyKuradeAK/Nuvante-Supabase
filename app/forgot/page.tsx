"use client";
import React, { useState } from "react";
import { useAuth, useSignIn } from "@clerk/nextjs";
import type { NextPage } from "next";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useClerk } from "@clerk/nextjs";

const ForgotPasswordPage: NextPage = () => {
  const { signOut } = useClerk();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [successfulCreation, setSuccessfulCreation] = useState(false);
  const [secondFactor, setSecondFactor] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { isLoaded, signIn, setActive } = useSignIn();

  if (!isLoaded) {
    return null;
  }

  if (isSignedIn) {
    router.push("/");
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    await signIn
      ?.create({
        strategy: "reset_password_email_code",
        identifier: email,
      })
      .then((_) => {
        setSuccessfulCreation(true);
        setError("");
      })
      .catch((err) => {
        console.error("error", err.errors[0].longMessage);
        setError(err.errors[0].longMessage);
      });
  }

  async function reset(e: React.FormEvent) {
    e.preventDefault();
    await signIn
      ?.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password,
      })
      .then(async (result) => {
        if (result.status === "needs_second_factor") {
          setSecondFactor(true);
          setError("");
        } else if (result.status === "complete") {
          const response = await axios.post("/api/populate/", {
            firstName: "existing",
            lastName: "existing",
            password: password,
            address: "existing",
            email: email,
          });
          if (response.data === "success") {
            console.log("success from page.tsx (forgot)");
            setActive({ session: result.createdSessionId });
            setError("");
            router.push("/Profile");
          } else {
            signOut({ redirectUrl: "/sign-up" });
          }
          router.push("/Profile");
        } else {
          console.log(result);
        }
      })
      .catch((err) => {
        console.error("error", err.errors[0].longMessage);
        setError(err.errors[0].longMessage);
      });
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">
        Forgot Password?
      </h1>
      <form
        className="flex flex-col gap-4 w-full max-w-md bg-white p-6 rounded-lg shadow-lg"
        onSubmit={!successfulCreation ? create : reset}
      >
        {!successfulCreation && (
          <>
            <label htmlFor="email" className="text-sm text-gray-600">
              Provide your email address
            </label>
            <input
              type="email"
              placeholder="e.g john@doe.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button className="w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
              Send password reset code
            </button>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </>
        )}

        {successfulCreation && (
          <>
            <label htmlFor="password" className="text-sm text-gray-600">
              Enter your new password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <label htmlFor="code" className="text-sm text-gray-600">
              Enter the password reset code that was sent to your email
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button className="w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
              Reset
            </button>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </>
        )}

        {secondFactor && (
          <p className="text-sm text-gray-700">
            2FA is required, but this UI does not handle that
          </p>
        )}
      </form>
    </div>
  );
};

export default ForgotPasswordPage;
