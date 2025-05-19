"use client";
import React from "react";
import { useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Sidebar from "@/components/Sidebar";
import axios from "axios";
import { useEffect } from "react";
import Image from "next/image";
import { motion, useAnimationControls } from "framer-motion";

const logo = "/logo.png";

const Page = () => {
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [globalEmail, setGlobalEmail] = useState<string>("");
  const [loaded, setLoaded] = useState(false);

  const custom_propagation_flow = async () => {
    const response = await axios
      .get("/api/propagation_client/")
      .then((data) => {
        return data;
      });

    if (response.data != 404) {
      setFirstName(response.data.firstName);
      setLastName(response.data.lastName);
      setAddress(response.data.address);
      setLoaded(true);
    } else {
      alert("There was an error fetching the profile. Please try refreshing");
      setLoaded(false);
    }
  };

  const fetch_current_email = async () => {
    const response = await axios.get("/api/emailify/");
    setGlobalEmail(response.data);
  };

  const lazily_update_database = async () => {
    const response = await axios.post("/api/populate/", {
      firstName: firstName,
      lastName: lastName,
      password: "existing",
      address: address,
      email: "existing",
    });
    console.log("modifying the database in page.tsx (Profile)\n", response);
  };

  useEffect(() => {
    fetch_current_email();
    custom_propagation_flow();
  }, []);

  return (
    <>
      <Navbar />
      <div className="p-4">
        <div className="mt-6 ml-4 lg:ml-32">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Profile</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {!loaded && (
          <motion.div
            className="w-fit mx-auto mt-20"
            animate={{
              rotate: 360,
              transition: {
                duration: 1.5,
              },
            }}
          >
            <Image src={logo} alt="preloader" width={60} height={60}></Image>
          </motion.div>
        )}
        {loaded && (
          <div className="flex flex-col lg:flex-row ml-4 lg:ml-32 mt-8 lg:mt-24">
            <div className="flex flex-col">
              <div className="flex flex-col">
                <h1 className="font-medium">Manage My Account</h1>
                <div className="flex flex-col ml-4 lg:ml-10 pt-4 font-normal">
                  <div className="text-[#DB4444] font-normal cursor-pointer">
                    My Profile
                  </div>
                </div>
              </div>
              <div className="pt-10 font-normal gap-3 flex flex-col">
                <Sidebar></Sidebar>
              </div>
            </div>

            <div className="flex flex-col w-auto lg:w-[870px] pb-10 rounded-sm border lg:ml-32 bg-[#FFFFFF]">
              <div className="mt-8 lg:mt-[40px] ml-4 lg:ml-[80px] h-[28px] w-[155px]">
                <h1 className="font-medium text-[#DB4444]">
                  Edit Your Profile
                </h1>
              </div>
              <div className="flex flex-col lg:flex-row ml-4 lg:ml-[80px] w-full lg:w-[710px] h-auto lg:h-[82px] mt-8">
                <div className="w-full lg:w-[330px] h-[62px]">
                  <h1 className="font-normal">First Name</h1>
                  <input
                    className="mt-1 p-2 w-full lg:w-[330px] h-[50px] bg-[#F5F5F5] rounded-sm placeholder:pl-3"
                    type="text"
                    placeholder="Daksh"
                    value={firstName}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                    }}
                  />
                </div>
                <div className="w-full lg:w-[330px] h-[62px] mt-4 lg:mt-0 lg:ml-10">
                  <h1 className="font-normal">Last Name</h1>
                  <input
                    className="mt-1 p-2 w-full lg:w-[330px] h-[50px] bg-[#F5F5F5] rounded-sm placeholder:pl-3"
                    type="text"
                    placeholder="XYZ"
                    value={lastName}
                    onChange={(e) => {
                      setLastName(e.target.value);
                    }}
                  />
                </div>
              </div>
              <div className="flex flex-col lg:flex-row ml-4 lg:ml-[80px] w-auto lg:w-[710px] h-auto lg:h-[82px] mt-8">
                <div className="w-full lg:w-[330px] h-[62px]">
                  <h1 className="font-normal">Email</h1>
                  <input
                    className="mt-1 lg:w-[330px] p-2 h-[50px] bg-[#F5F5F5] rounded-sm placeholder:pl-3"
                    type="text"
                    placeholder="xyz@gmail.com"
                    value={globalEmail}
                    readOnly
                    contentEditable={false}
                  />
                </div>
                <div className="w-auto lg:w-[330px] h-[62px] mt-4 lg:mt-0 lg:ml-10">
                  <h1 className="font-normal">Address</h1>
                  <input
                    className="mt-1 p-2 w-full lg:w-[330px] h-[50px] bg-[#F5F5F5] rounded-sm placeholder:pl-3"
                    type="text"
                    placeholder="Delhi"
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                    }}
                  />
                </div>
              </div>
              {/* <div className="flex flex-col ml-4 lg:ml-[80px] w-auto lg:w-[710px] h-auto lg:h-[214px] mt-8">
              <h1 className="font-normal">Password Changes</h1>
              <input
                className="w-full lg:w-[710px] h-[50px] bg-[#F5F5F5] rounded-sm mt-1 placeholder:pl-3"
                type="text"
                placeholder="Current Password"
              />
              <input
                className="w-full lg:w-[710px] h-[50px] bg-[#F5F5F5] rounded-sm mt-2 placeholder:pl-3"
                type="text"
                placeholder="New Password"
              />
              <input
                className="w-full lg:w-[710px] h-[50px] bg-[#F5F5F5] rounded-sm mt-2 placeholder:pl-3"
                type="text"
                placeholder="Confirm New Password"
              />
            </div> */}
              <div className="flex flex-row justify-end mt-10">
                <button className="mr-4 lg:mr-6">Cancel</button>
                <button
                  className="bg-[#DB4444] w-[250px] lg:w-[250px] h-[56px] font-medium rounded-sm text-white mr-4 lg:mr-[80px]"
                  onClick={lazily_update_database}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Page;
