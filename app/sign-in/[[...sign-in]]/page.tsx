"use client";
import React from "react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import Link from "next/link";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

const sideImg = "/Side-Image.jpg";
const googleLogo = "/Icon-Google.png";

type Props = {};

const page = (props: Props) => {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const router = useRouter();
  const user = useUser();
  // console.log(user);

  // Handle the submission of the sign-in form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoaded) return;

    // Start the sign-in process using the email and password provided
    try {
      const signInAttempt = await signIn.create({
        identifier: email,
        password,
      });

      // If sign-in process is complete, set the created session as active
      // and redirect the user
      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.push("/");
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err: any) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.log(JSON.parse(JSON.stringify(err)));
      // console.log(JSON.stringify(err, null, 2));
      alert(err.errors[0].message);
    }
  };

  return (
    <>
      {!user.isSignedIn && (
        <div>
          <Navbar />
          <div className="flex flex-col xl:flex-row xl:h-[781px] mx-auto xl:w-[1305px] xl:items-center xl:justify-around xl:mt-12 items-center">
            <div>
              <Image src={sideImg} alt="side-image" height={400} width={700} />
            </div>
            <div className="h-auto w-full max-w-[371px] flex flex-col justify-between items-center">
              <div className="text-left xl:text-left">
                <h1 className="text-[36px] xl:text-[36px] font-medium">
                  Log In to Nuvante
                </h1>
                <p className="font-normal text-left text-sm pt-5">
                  Enter your details here
                </p>
              </div>
              <div className="w-full xl:w-[370px] flex flex-col xl:justify-between items-center mt-5">
                <input
                  className="h-[32px] w-full bg-transparent border-b border-black mt-3"
                  placeholder="Email or Phone number"
                  onChange={(e) => setEmail(e.target.value)}
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                />
                <input
                  className="h-[32px] w-full bg-transparent border-b border-black mt-3"
                  placeholder="Password"
                  onChange={(e) => setPassword(e.target.value)}
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                />
              </div>
              <div className="flex flex-col xl:flex-row items-center justify-between w-full max-w-[370px] mt-5">
                <button
                  className="h-[56px] w-[143px] bg-[#DB4444] text-white"
                  onClick={handleSubmit}
                >
                  Log In
                </button>
                <button
                  className="text-[#DB4444]"
                  onClick={() => {
                    router.push("/forgot");
                  }}
                >
                  Forgot Password?
                </button>
              </div>
              <p className="text-center mt-3">
                Not yet registered?{" "}
                <Link className="border-b border-black" href="/sign-up">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
          <Footer />
        </div>
      )}

      {user.isSignedIn && (
        <div>
          <h1 className="text-2xl m-10">You are already signed in</h1>
        </div>
      )}
    </>
  );
};

export default page;
