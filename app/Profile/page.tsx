"use client";
import React from "react";
import { useState, useCallback } from "react";
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
import { motion } from "framer-motion";
import { useAlert } from "@/context/AlertContext";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

const logo = "/logo.png";

type ProfileData = {
  firstName: string;
  lastName: string;
  address: string;
  email: string;
  cart: string[];
  wishlist: string[];
};

// Memoize the profile form component
const ProfileForm = React.memo(({ 
  firstName, 
  lastName, 
  address, 
  email,
  onFirstNameChange,
  onLastNameChange,
  onAddressChange,
  onSave
}: {
  firstName: string;
  lastName: string;
  address: string;
  email: string;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onAddressChange: (value: string) => void;
  onSave: () => Promise<void>;
}) => (
  <div className="flex flex-col w-auto lg:w-[870px] pb-10 rounded-sm border lg:ml-32 bg-[#FFFFFF]">
    <div className="mt-8 lg:mt-[40px] ml-4 lg:ml-[80px] h-[28px] w-[155px]">
      <h1 className="font-medium text-[#DB4444]">Edit Your Profile</h1>
    </div>
    <div className="flex flex-col lg:flex-row ml-4 lg:ml-[80px] w-full lg:w-[710px] h-auto lg:h-[82px] mt-8">
      <div className="w-full lg:w-[330px] h-[62px]">
        <h1 className="font-normal">First Name</h1>
        <input
          className="mt-1 p-2 w-full lg:w-[330px] h-[50px] bg-[#F5F5F5] rounded-sm placeholder:pl-3"
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => onFirstNameChange(e.target.value)}
        />
      </div>
      <div className="w-full lg:w-[330px] h-[62px] mt-4 lg:mt-0 lg:ml-10">
        <h1 className="font-normal">Last Name</h1>
        <input
          className="mt-1 p-2 w-full lg:w-[330px] h-[50px] bg-[#F5F5F5] rounded-sm placeholder:pl-3"
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => onLastNameChange(e.target.value)}
        />
      </div>
    </div>
    <div className="flex flex-col lg:flex-row ml-4 lg:ml-[80px] w-full lg:w-[710px] h-auto lg:h-[82px] mt-8">
      <div className="w-full lg:w-[330px] h-[62px]">
        <h1 className="font-normal">Email</h1>
        <input
          className="mt-1 lg:w-[330px] p-2 h-[50px] bg-[#F5F5F5] rounded-sm placeholder:pl-3"
          type="text"
          placeholder="Email"
          value={email}
          readOnly
          disabled
        />
      </div>
      <div className="w-auto lg:w-[330px] h-[62px] mt-4 lg:mt-0 lg:ml-10">
        <h1 className="font-normal">Address</h1>
        <input
          className="mt-1 p-2 w-full lg:w-[330px] h-[50px] bg-[#F5F5F5] rounded-sm placeholder:pl-3"
          type="text"
          placeholder="Address"
          value={address}
          onChange={(e) => onAddressChange(e.target.value)}
        />
      </div>
    </div>
    <div className="flex flex-row justify-end mt-10">
      <button 
        className="mr-4 lg:mr-6 text-gray-600 hover:text-gray-800 transition-colors"
        onClick={() => window.location.reload()}
      >
        Cancel
      </button>
      <button
        className="bg-[#DB4444] w-[250px] lg:w-[250px] h-[56px] font-medium rounded-sm text-white mr-4 lg:mr-[80px] hover:bg-[#c13a3a] transition-colors"
        onClick={onSave}
      >
        Save Changes
      </button>
    </div>
  </div>
));

ProfileForm.displayName = 'ProfileForm';

const ProfilePage = () => {
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: "",
    lastName: "",
    address: "",
    email: "",
    cart: [],
    wishlist: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const { showAlert } = useAlert();
  const router = useRouter();
  const user = useUser();

  const fetchUserData = useCallback(async () => {
    try {
      const [profileResponse, emailResponse] = await Promise.all([
        axios.get<ProfileData>("/api/propagation_client"),
        axios.get<string>("/api/emailify")
      ]);

      if (profileResponse.data) {
        // Use Clerk user data as fallback if database fields are empty
        const firstName = profileResponse.data.firstName || user.user?.firstName || "";
        const lastName = profileResponse.data.lastName || user.user?.lastName || "";
        const address = profileResponse.data.address || "Address not provided";

        setProfileData({
          firstName,
          lastName,
          address,
          email: emailResponse.data || "",
          cart: profileResponse.data.cart || [],
          wishlist: profileResponse.data.wishlist || []
        });
      }
      setIsLoaded(true);
    } catch (error) {
      console.error("Error fetching user data:", error);
      showAlert("Error loading profile data. Please try refreshing.", "error");
      setIsLoaded(false);
    }
  }, [showAlert, user.user]);

  const updateProfile = useCallback(async () => {
    // Validate input
    if (!profileData.firstName.trim()) {
      showAlert("First name is required", "error");
      return;
    }
    if (!profileData.lastName.trim()) {
      showAlert("Last name is required", "error");
      return;
    }
    if (!profileData.address.trim()) {
      showAlert("Address is required", "error");
      return;
    }

    setIsLoading(true);
    try {
      // Update client record first
      await axios.post("/api/populate", {
        firstName: profileData.firstName.trim(),
        lastName: profileData.lastName.trim(),
        password: "existing",
        address: profileData.address.trim(),
        email: "existing",
      });

      // Try to update Clerk user profile, but don't fail if it errors
      try {
        if (user.user) {
          await user.user.update({
            firstName: profileData.firstName.trim(),
            lastName: profileData.lastName.trim(),
          });
        }
      } catch (clerkError) {
        console.error("Clerk update failed but database was updated:", clerkError);
        // Don't show error to user since database update succeeded
      }

      showAlert("Profile updated successfully!", "success");
      await fetchUserData(); // Refresh the data after update
    } catch (error) {
      console.error("Error updating profile:", error);
      showAlert("Error updating profile. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [profileData, showAlert, fetchUserData, user.user]);

  const handleFieldChange = useCallback((field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  }, []);

  useEffect(() => {
    if (!user.isSignedIn) {
      showAlert("Please sign in to access your profile", "warning");
      router.push("/sign-in");
      return;
    }
    fetchUserData();
  }, [fetchUserData, user.isSignedIn, showAlert, router]);

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

        {isLoading && (
          <div className="h-screen flex items-center justify-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-[#DB4444] border-t-transparent rounded-full animate-spin"></div>
              <Image 
                src={logo} 
                alt="Loading..." 
                width={40} 
                height={40} 
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              />
            </div>
          </div>
        )}

        {!isLoading && isLoaded && (
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
                <Sidebar />
              </div>
            </div>

            <ProfileForm
              firstName={profileData.firstName}
              lastName={profileData.lastName}
              address={profileData.address}
              email={profileData.email}
              onFirstNameChange={(value) => handleFieldChange('firstName', value)}
              onLastNameChange={(value) => handleFieldChange('lastName', value)}
              onAddressChange={(value) => handleFieldChange('address', value)}
              onSave={updateProfile}
            />
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default ProfilePage;
