"use client";
import React from "react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import Link from "next/link";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import axios from "axios";

const sideImg = "/Side-Image.jpg";
// const googleLogo = "/Icon-Google.png"; // Uncomment if using Google auth

const SignUpPage = () => {
  const { signOut } = useClerk();
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [name, setName] = React.useState("");
  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [verifying, setVerifying] = React.useState(false);
  const [code, setCode] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    try {
      await signUp.create({
        emailAddress,
        password,
      });

      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      setVerifying(true);
    } catch (err: any) {
      console.error("Signup Error:", JSON.stringify(err, null, 2));
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (signUpAttempt.status === "complete") {
        const [firstName, lastNameRaw] = name.split(" ");
        const lastName = lastNameRaw || "";

        const res = await axios.post(`/api/populate/`, {
          firstName,
          lastName,
          password,
          address: "xyz road",
          email: emailAddress,
        });

        if (res.status === 200) {
          await setActive({
            session: signUpAttempt.createdSessionId,
            redirectUrl: "/Profile",
          });
        } else {
          alert("Error syncing with database. Please try again.");
          signOut({ redirectUrl: "/sign-up" });
        }
      } else {
        alert("Verification failed. Please try again.");
        console.error("Verification incomplete:", signUpAttempt);
      }
    } catch (err: any) {
      console.error("Verify Error:", JSON.stringify(err, null, 2));
    }
  };

  if (verifying) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-4">
        <h1 className="text-2xl font-semibold mb-6 text-gray-800">
          Verify Your Email
        </h1>
        <form
          className="flex flex-col items-center gap-4 w-full max-w-md bg-white p-6 rounded-lg shadow-lg"
          onSubmit={handleVerify}
        >
          <label htmlFor="code" className="text-gray-600 text-sm">
            Enter your verification code
          </label>
          <input
            type="text"
            id="code"
            name="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600"
          >
            Verify
          </button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="flex flex-col xl:flex-row xl:h-[781px] xl:w-[1305px] xl:items-center xl:justify-around xl:mt-12 items-center">
        <div>
          <Image src={sideImg} alt="side-image" height={400} width={600} />
        </div>
        <div className="h-auto w-full max-w-[371px] flex flex-col justify-between items-center">
          <div className="text-left xl:text-left">
            <h1 className="text-[36px] font-medium">Create an Account</h1>
            <p className="text-sm pt-5">Enter your details here</p>
          </div>
          <div className="w-full mt-5">
            <input
              className="h-[32px] w-full bg-transparent border-b border-black mt-3"
              type="text"
              placeholder="Enter full name"
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="h-[32px] w-full bg-transparent border-b border-black mt-3"
              type="email"
              placeholder="Enter your email"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
            />
            <input
              className="h-[32px] w-full bg-transparent border-b border-black mt-3"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="flex flex-col items-center w-full max-w-[370px] mt-5">
            <button
              className="h-[56px] w-full bg-[#DB4444] text-white"
              onClick={handleSubmit}
            >
              Create Account
            </button>
            <p className="text-center mt-3">
              Already have an account?{" "}
              <Link className="border-b border-black" href="/sign-in">
                Login in
              </Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SignUpPage;
