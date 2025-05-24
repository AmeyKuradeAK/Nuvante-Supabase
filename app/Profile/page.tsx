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
import { useUser, useClerk } from "@clerk/nextjs";
import { LogOut } from "lucide-react";

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
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col w-auto lg:w-[870px] pb-10 rounded-xl border lg:ml-32 bg-white shadow-sm hover:shadow-md transition-all duration-300 ease-in-out"
  >
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 }}
      className="mt-8 lg:mt-[40px] ml-4 lg:ml-[80px] h-[28px] w-[155px]"
    >
      <h1 className="font-medium text-[#DB4444] text-lg">Edit Your Profile</h1>
    </motion.div>
    <div className="flex flex-col lg:flex-row ml-4 lg:ml-[80px] w-full lg:w-[710px] h-auto lg:h-[82px] mt-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full lg:w-[330px] h-[62px]"
      >
        <h1 className="font-medium text-gray-700">First Name</h1>
        <input
          className="mt-1 p-2 w-full lg:w-[330px] h-[50px] bg-gray-50 rounded-lg border border-gray-200 focus:border-[#DB4444] focus:ring-2 focus:ring-[#DB4444] focus:ring-opacity-20 transition-all duration-300 ease-in-out"
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => onFirstNameChange(e.target.value)}
        />
      </motion.div>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="w-full lg:w-[330px] h-[62px] mt-4 lg:mt-0 lg:ml-10"
      >
        <h1 className="font-medium text-gray-700">Last Name</h1>
        <input
          className="mt-1 p-2 w-full lg:w-[330px] h-[50px] bg-gray-50 rounded-lg border border-gray-200 focus:border-[#DB4444] focus:ring-2 focus:ring-[#DB4444] focus:ring-opacity-20 transition-all duration-300 ease-in-out"
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => onLastNameChange(e.target.value)}
        />
      </motion.div>
    </div>
    <div className="flex flex-col lg:flex-row ml-4 lg:ml-[80px] w-full lg:w-[710px] h-auto lg:h-[82px] mt-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="w-full lg:w-[330px] h-[62px]"
      >
        <h1 className="font-medium text-gray-700">Email</h1>
        <input
          className="mt-1 lg:w-[330px] p-2 h-[50px] bg-gray-100 rounded-lg border border-gray-200 cursor-not-allowed transition-all duration-300"
          type="text"
          placeholder="Email"
          value={email}
          readOnly
          disabled
        />
      </motion.div>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-auto lg:w-[330px] h-[62px] mt-4 lg:mt-0 lg:ml-10"
      >
        <h1 className="font-medium text-gray-700">Address</h1>
        <input
          className="mt-1 p-2 w-full lg:w-[330px] h-[50px] bg-gray-50 rounded-lg border border-gray-200 focus:border-[#DB4444] focus:ring-2 focus:ring-[#DB4444] focus:ring-opacity-20 transition-all duration-300 ease-in-out"
          type="text"
          placeholder="Address"
          value={address}
          onChange={(e) => onAddressChange(e.target.value)}
        />
      </motion.div>
    </div>
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="flex flex-row justify-end mt-10"
    >
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="mr-4 lg:mr-6 text-gray-600 hover:text-gray-800 transition-all duration-300 ease-in-out px-4 py-2 rounded-lg hover:bg-gray-100"
        onClick={() => window.location.reload()}
      >
        Cancel
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="bg-[#DB4444] w-[250px] lg:w-[250px] h-[56px] font-medium rounded-lg text-white mr-4 lg:mr-[80px] hover:bg-[#c13a3a] transition-all duration-300 ease-in-out shadow-sm hover:shadow-md"
        onClick={onSave}
      >
        Save Changes
      </motion.button>
    </motion.div>
  </motion.div>
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
  const { signOut } = useClerk();

  const handleLogout = async () => {
    try {
      await signOut();
      showAlert("Logged out successfully", "success");
      router.push("/");
    } catch (error) {
      console.error("Error logging out:", error);
      showAlert("Error logging out. Please try again.", "error");
    }
  };

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
        const address = profileResponse.data.address || "";

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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/" className="text-gray-600 hover:text-[#DB4444] transition-colors duration-300 ease-in-out">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-[#DB4444]">Profile</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          <Sidebar />
          <div className="flex-1">
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
            
            {/* Logout Button */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mt-6 flex justify-end"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProfilePage;
