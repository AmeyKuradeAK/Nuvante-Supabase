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
import axios from "axios";
import { useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useAlert } from "@/context/AlertContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import { LogOut, AlertCircle, CheckCircle } from "lucide-react";

const logo = "/logo.png";

type ProfileData = {
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  cart: string[];
  wishlist: string[];
  cartQuantities: Map<string, number>;
  cartSizes: Map<string, string>;
  orders: Array<{
    orderId: string;
    paymentId: string;
    amount: number;
    currency: string;
    timestamp: string;
    estimatedDeliveryDate: string;
    items: string[];
    trackingId: string;
    itemStatus: string;
    itemDetails: {
      productId: string;
      size: string;
      quantity: number;
    }[];
    shippingAddress: {
      firstName: string;
      lastName: string;
      streetAddress: string;
      apartment: string;
      city: string;
      phone: string;
      email: string;
    };
  }>;
};

// Profile completion banner component
const ProfileCompletionBanner = ({ isIncomplete, isWelcome }: { isIncomplete: boolean; isWelcome: boolean }) => {
  if (!isIncomplete && !isWelcome) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mb-6 p-4 rounded-lg border-l-4 ${
        isWelcome 
          ? 'bg-blue-50 border-blue-400' 
          : 'bg-amber-50 border-amber-400'
      }`}
    >
      <div className="flex items-center">
        {isWelcome ? (
          <CheckCircle className="w-5 h-5 text-blue-600 mr-3" />
        ) : (
          <AlertCircle className="w-5 h-5 text-amber-600 mr-3" />
        )}
        <div>
          <h3 className={`font-semibold ${isWelcome ? 'text-blue-800' : 'text-amber-800'}`}>
            {isWelcome ? 'Welcome to Nuvante!' : 'Complete Your Profile'}
          </h3>
          <p className={`text-sm ${isWelcome ? 'text-blue-700' : 'text-amber-700'}`}>
            {isWelcome 
              ? 'Please complete your profile information to get started with shopping.'
              : 'Please update your first name, last name, and mobile number to proceed with shopping.'
            }
          </p>
        </div>
      </div>
    </motion.div>
  );
};

// Memoize the profile form component
const ProfileForm = React.memo(({ 
  firstName, 
  lastName, 
  mobileNumber,
  email,
  onFirstNameChange,
  onLastNameChange,
  onMobileNumberChange,
  onSave,
  isIncomplete
}: {
  firstName: string;
  lastName: string;
  mobileNumber: string;
  email: string;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onMobileNumberChange: (value: string) => void;
  onSave: () => Promise<void>;
  isIncomplete: boolean;
}) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`flex flex-col w-auto lg:w-[870px] pb-10 rounded-xl border lg:ml-32 bg-white shadow-sm hover:shadow-md transition-all duration-300 ease-in-out ${
      isIncomplete ? 'border-amber-300 shadow-amber-100' : ''
    }`}
  >
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 }}
      className="mt-8 lg:mt-[40px] ml-4 lg:ml-[80px] h-[28px] w-[155px]"
    >
      <h1 className={`font-medium text-lg ${isIncomplete ? 'text-amber-600' : 'text-[#DB4444]'}`}>
        {isIncomplete ? 'Complete Your Profile' : 'Edit Your Profile'}
      </h1>
    </motion.div>
    <div className="flex flex-col lg:flex-row ml-4 lg:ml-[80px] w-full lg:w-[710px] h-auto lg:h-[82px] mt-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full lg:w-[330px] h-[62px]"
      >
        <h1 className="font-medium text-gray-700">
          First Name {isIncomplete && <span className="text-red-500">*</span>}
        </h1>
        <input
          className={`mt-1 p-2 w-full lg:w-[330px] h-[50px] bg-gray-50 rounded-lg border transition-all duration-300 ease-in-out ${
            isIncomplete && (!firstName || firstName === 'User')
              ? 'border-amber-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500 focus:ring-opacity-20'
              : 'border-gray-200 focus:border-[#DB4444] focus:ring-2 focus:ring-[#DB4444] focus:ring-opacity-20'
          }`}
          type="text"
          placeholder="Enter your first name"
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
        <h1 className="font-medium text-gray-700">
          Last Name {isIncomplete && <span className="text-red-500">*</span>}
        </h1>
        <input
          className={`mt-1 p-2 w-full lg:w-[330px] h-[50px] bg-gray-50 rounded-lg border transition-all duration-300 ease-in-out ${
            isIncomplete && (!lastName || lastName === 'User')
              ? 'border-amber-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500 focus:ring-opacity-20'
              : 'border-gray-200 focus:border-[#DB4444] focus:ring-2 focus:ring-[#DB4444] focus:ring-opacity-20'
          }`}
          type="text"
          placeholder="Enter your last name"
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
        <h1 className="font-medium text-gray-700">
          Mobile Number {isIncomplete && <span className="text-red-500">*</span>}
        </h1>
        <input
          className={`mt-1 p-2 w-full lg:w-[330px] h-[50px] bg-gray-50 rounded-lg border transition-all duration-300 ease-in-out ${
            isIncomplete && (!mobileNumber || mobileNumber === 'Not provided')
              ? 'border-amber-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500 focus:ring-opacity-20'
              : 'border-gray-200 focus:border-[#DB4444] focus:ring-2 focus:ring-[#DB4444] focus:ring-opacity-20'
          }`}
          type="tel"
          placeholder="Enter your mobile number"
          value={mobileNumber}
          onChange={(e) => onMobileNumberChange(e.target.value)}
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
        className={`w-[250px] lg:w-[250px] h-[56px] font-medium rounded-lg text-white mr-4 lg:mr-[80px] transition-all duration-300 ease-in-out shadow-sm hover:shadow-md ${
          isIncomplete 
            ? 'bg-amber-600 hover:bg-amber-700' 
            : 'bg-[#DB4444] hover:bg-[#c13a3a]'
        }`}
        onClick={onSave}
      >
        {isIncomplete ? 'Complete Profile' : 'Save Changes'}
      </motion.button>
    </motion.div>
  </motion.div>
));

ProfileForm.displayName = 'ProfileForm';

const ProfilePage = () => {
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: "",
    lastName: "",
    email: "",
    mobileNumber: "",
    cart: [],
    wishlist: [],
    cartQuantities: new Map(),
    cartSizes: new Map(),
    orders: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isIncomplete, setIsIncomplete] = useState(false);

  const { showAlert } = useAlert();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isSignedIn } = useUser();
  const { signOut } = useClerk();

  const isWelcome = searchParams.get('welcome') === 'true';

  const checkProfileCompletion = (data: ProfileData) => {
    const incomplete = !data.firstName || 
                      data.firstName === 'User' || 
                      !data.lastName || 
                      data.lastName === 'User' || 
                      !data.mobileNumber || 
                      data.mobileNumber === 'Not provided';
    setIsIncomplete(incomplete);
    return incomplete;
  };

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
      // Use the new profile API
      const response = await axios.get<{ user: any }>("/api/profile");
      
      if (response.data?.user) {
        const data = response.data.user;
        
        const profileData = {
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          mobileNumber: data.mobileNumber === "Not provided" ? "" : data.mobileNumber || "",
          cart: data.cart || [],
          wishlist: data.wishlist || [],
          cartQuantities: data.cartQuantities || new Map(),
          cartSizes: data.cartSizes || new Map(),
          orders: data.orders || []
        };

        setProfileData(profileData);
        checkProfileCompletion(profileData);
      }
      setIsLoaded(true);
    } catch (error: any) {
      console.error("Error fetching user data:", error);
      showAlert("Error loading profile data. Please try refreshing.", "error");
      setIsLoaded(false);
    }
  }, [showAlert]);

  const updateProfile = useCallback(async () => {
    // Validate input
    if (!profileData.firstName.trim() || profileData.firstName === 'User') {
      showAlert("Please enter your first name", "error");
      return;
    }
    if (!profileData.lastName.trim() || profileData.lastName === 'User') {
      showAlert("Please enter your last name", "error");
      return;
    }
    if (!profileData.mobileNumber.trim()) {
      showAlert("Please enter your mobile number", "error");
      return;
    }

    // Validate mobile number format
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(profileData.mobileNumber.trim())) {
      showAlert("Please enter a valid 10-digit mobile number", "error");
      return;
    }

    setIsLoading(true);
    try {
      // Use the new profile API
      const response = await axios.put("/api/profile", {
        firstName: profileData.firstName.trim(),
        lastName: profileData.lastName.trim(),
        mobileNumber: profileData.mobileNumber.trim()
      });

      if (response.status === 200) {
        showAlert("Profile updated successfully!", "success");
        setIsIncomplete(false);
        
        // If this was a welcome flow, redirect to home after completion
        if (isWelcome) {
          setTimeout(() => {
            router.push("/");
          }, 2000);
        } else {
          // Refresh the data after successful update
          await fetchUserData();
        }
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);
      const errorMessage = error.response?.data?.error || "Error updating profile. Please try again.";
      showAlert(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  }, [profileData, showAlert, fetchUserData, router, isWelcome]);

  useEffect(() => {
    if (!isSignedIn || !user) {
      showAlert("Please sign in to access your profile", "warning");
      router.push("/sign-in");
      return;
    }
    fetchUserData();
  }, [fetchUserData, isSignedIn, user, showAlert, router]);

  // Show welcome alert on first load
  useEffect(() => {
    if (isWelcome && isLoaded) {
      showAlert("Welcome to Nuvante! Please complete your profile to get started.", "info");
    }
  }, [isWelcome, isLoaded, showAlert]);

  return (
    <div className="min-h-screen bg-gray-50">
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-[#DB4444] border-t-transparent rounded-full animate-spin"></div>
            <Image 
              src={logo} 
              alt="Loading..." 
              width={40} 
              height={40} 
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse"
            />
          </div>
        </div>
      )}
      {!isLoading && (
        <>
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <div className="max-w-7xl mx-auto">
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

              <ProfileCompletionBanner isIncomplete={isIncomplete} isWelcome={isWelcome} />

              <div className="flex justify-between items-start mb-8">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">
                    {isWelcome ? 'Complete Your Profile' : 'My Profile'}
                  </h1>
                  <p className="text-gray-600 mt-2">
                    {isIncomplete 
                      ? 'Please provide your information to continue shopping'
                      : 'Manage your account information'
                    }
                  </p>
                </div>
                {!isWelcome && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-6 py-3 bg-[#DB4444] text-white rounded-lg hover:bg-black transition-all duration-300"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </motion.button>
                )}
              </div>

              <ProfileForm
                firstName={profileData.firstName}
                lastName={profileData.lastName}
                mobileNumber={profileData.mobileNumber}
                email={profileData.email}
                onFirstNameChange={(value) => setProfileData(prev => ({ ...prev, firstName: value }))}
                onLastNameChange={(value) => setProfileData(prev => ({ ...prev, lastName: value }))}
                onMobileNumberChange={(value) => setProfileData(prev => ({ ...prev, mobileNumber: value }))}
                onSave={updateProfile}
                isIncomplete={isIncomplete}
              />
            </div>
          </main>
          <Footer />
        </>
      )}
    </div>
  );
};

export default ProfilePage;
