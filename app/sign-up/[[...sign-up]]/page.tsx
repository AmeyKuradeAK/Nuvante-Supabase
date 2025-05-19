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
const googleLogo = "/Icon-Google.png";

type Props = {};

const domain = process.env.NEXT_PUBLIC_DOMAIN;

const page = (props: Props) => {
  const { signOut } = useClerk();
  const [name, setName] = React.useState("");
  const { isLoaded, signUp, setActive } = useSignUp();
  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [verifying, setVerifying] = React.useState(false);
  const [code, setCode] = React.useState("");
  const router = useRouter();

  // Handle submission of the sign-up form
  const handleSubmit = async (e: React.FormEvent) => {
    console.log(name, emailAddress, password, verifying, code);
    e.preventDefault();

    if (!isLoaded) return;

    // Start the sign-up process using the email and password provided
    try {
      await signUp.create({
        emailAddress,
        password,
      });

      // Send the user an email with the verification code
      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      // Set 'verifying' true to display second form
      // and capture the OTP code
      setVerifying(true);
    } catch (err: any) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
    }
  };

  // Handle the submission of the verification form
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoaded) return;

    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === "complete") {
        const response = await axios
          .post(`/api/populate/`, {
            firstName: name.split(" ")[0],
            lastName: name.split(" ")[1],
            password: password,
            address: "xyz road",
            email: emailAddress,
          })
          .then(async (data) => {
            if (data.data === "Success") {
              await setActive({
                session: signUpAttempt.createdSessionId,
                redirectUrl: "/Profile",
              });
            }
          });

        console.log("couldn't generate active session");
        alert("Couldn't generate active session, please sign up again");
        router.push("/sign-up");

        // if (response.data === "success") {
        //   await setActive({
        //     session: signUpAttempt.createdSessionId,
        //     redirectUrl: "/Profile",
        //   });
        // } else {
        //   alert(
        //     "That process failed because the database couldn't process the sign-up info."
        //   );
        //   signOut({ redirectUrl: "/sign-up" });
        // }
      } else {
        alert(
          "That process failed because connection to @clerkjs was not established."
        );
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error(JSON.stringify(signUpAttempt, null, 2));
      }
    } catch (err: any) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error("Error:", JSON.stringify(err, null, 2));
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
            value={code}
            id="code"
            name="code"
            onChange={(e) => setCode(e.target.value)}
            className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
            <h1 className="text-[36px] xl:text-[36px] font-medium">
              Create an Account
            </h1>
            <p className="font-normal text-left text-sm pt-5">
              Enter your details here
            </p>
          </div>
          <div className="w-full xl:w-[370px] flex flex-col xl:justify-between items-center mt-5">
            <input
              className="h-[32px] w-full bg-transparent border-b border-black mt-3"
              type="text"
              placeholder="Enter full name"
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="h-[32px] w-full bg-transparent border-b border-black mt-3"
              id="email"
              type="email"
              name="email"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              placeholder="Enter your email"
            />
            <input
              className="h-[32px] w-full bg-transparent border-b border-black mt-3"
              id="password"
              type="password"
              name="password"
              value={password}
              placeholder="Enter your password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="flex flex-col items-center justify-between w-full max-w-[370px] mt-5">
            <button
              className="h-[56px] w-full bg-[#DB4444] text-white"
              onClick={handleSubmit}
            >
              Create Account
            </button>
            {/* <button className="h-[56px] w-full mt-3 flex flex-row items-center justify-center border border-black">
              <Image
                className="mr-3"
                src={googleLogo}
                alt="google"
                height={24}
                width={24}
              />
              <p className="font-normal">Sign up with Google</p> */}
            {/* </button> */}
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

export default page;
