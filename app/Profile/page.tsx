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
import { useRouter } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import { LogOut } from "lucide-react";

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

// Memoize the profile form component
const ProfileForm = React.memo(({ 
  firstName, 
  lastName, 
  mobileNumber,
  email,
  isNewUser,
  onFirstNameChange,
  onLastNameChange,
  onMobileNumberChange,
  onSave
}: {
  firstName: string;
  lastName: string;
  mobileNumber: string;
  email: string;
  isNewUser: boolean;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onMobileNumberChange: (value: string) => void;
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
        <h1 className="font-medium text-gray-700">Mobile Number</h1>
        <input
          className="mt-1 p-2 w-full lg:w-[330px] h-[50px] bg-gray-50 rounded-lg border border-gray-200 focus:border-[#DB4444] focus:ring-2 focus:ring-[#DB4444] focus:ring-opacity-20 transition-all duration-300 ease-in-out"
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
        className="bg-[#DB4444] w-[250px] lg:w-[250px] h-[56px] font-medium rounded-lg text-white mr-4 lg:mr-[80px] hover:bg-[#c13a3a] transition-all duration-300 ease-in-out shadow-sm hover:shadow-md"
        onClick={onSave}
      >
        {isNewUser ? "Complete Profile & Start Shopping" : "Save Changes"}
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
  const [isNewUser, setIsNewUser] = useState(false);
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
      const response = await axios.get<ProfileData>("/api/propagation_client");
      
      if (response.data) {
        const data = response.data;
        
        // Check if this is a new signup by looking for sessionStorage data
        const signupData = sessionStorage.getItem('signupData');
        let isNewSignup = false;
        
        if (signupData) {
          try {
            const parsedSignupData = JSON.parse(signupData);
            isNewSignup = true;
            setIsNewUser(true); // Mark as new user
            
            // Pre-populate with signup data if profile is incomplete
            const isIncomplete = data.mobileNumber === "Not provided" || 
                                !data.firstName || 
                                data.firstName === "User" ||
                                !data.lastName ||
                                data.lastName === "User";
            
            if (isIncomplete) {
              setProfileData({
                firstName: parsedSignupData.firstName || data.firstName || "",
                lastName: parsedSignupData.lastName || data.lastName || "",
                email: data.email || "",
                mobileNumber: parsedSignupData.mobileNumber || "",
                cart: data.cart || [],
                wishlist: data.wishlist || [],
                cartQuantities: data.cartQuantities || new Map(),
                cartSizes: data.cartSizes || new Map(),
                orders: data.orders || []
              });
              
              showAlert("Welcome! Please complete your profile information below.", "info");
              // Clear the signup data after using it
              sessionStorage.removeItem('signupData');
              setIsLoaded(true);
              return;
            }
            
            // Clear signup data if profile is already complete
            sessionStorage.removeItem('signupData');
          } catch (e) {
            console.error("Error parsing signup data:", e);
            sessionStorage.removeItem('signupData');
          }
        }
        
        // Check if profile is incomplete (auto-created) - also indicates new user
        const isIncomplete = data.mobileNumber === "Not provided" || 
                            !data.firstName || 
                            data.firstName === "User" ||
                            !data.lastName ||
                            data.lastName === "User";
        
        if (isIncomplete) {
          setIsNewUser(true); // Mark as new user if profile is incomplete
          if (!isNewSignup) {
            showAlert("Please complete your profile information", "warning");
          }
        }
        
        setProfileData({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          mobileNumber: data.mobileNumber === "Not provided" ? "" : data.mobileNumber || "",
          cart: data.cart || [],
          wishlist: data.wishlist || [],
          cartQuantities: data.cartQuantities || new Map(),
          cartSizes: data.cartSizes || new Map(),
          orders: data.orders || []
        });
      }
      setIsLoaded(true);
    } catch (error: any) {
      console.error("Error fetching user data:", error);
      if (error.response?.status === 404) {
        showAlert("Creating your profile...", "info");
        // The auto-create in propagation_client should handle this
        setTimeout(() => {
          fetchUserData(); // Retry after auto-create
        }, 2000);
      } else {
        showAlert("Error loading profile data. Please try refreshing.", "error");
      }
      setIsLoaded(false);
    }
  }, [showAlert]);

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
    if (!profileData.mobileNumber.trim()) {
      showAlert("Mobile number is required", "error");
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
      // Update client record in database
      const response = await axios.post("/api/populate", {
        firstName: profileData.firstName.trim(),
        lastName: profileData.lastName.trim(),
        mobileNumber: profileData.mobileNumber.trim(),
        email: profileData.email,
        cart: profileData.cart,
        wishlist: profileData.wishlist,
        cartQuantities: profileData.cartQuantities,
        cartSizes: profileData.cartSizes,
        orders: profileData.orders
      });

      if (response.status === 200) {
        if (isNewUser) {
          // For new users, redirect to home page after successful profile completion
          showAlert("Profile completed successfully! Welcome to Nuvante!", "success");
          setTimeout(() => {
            router.push("/");
          }, 1500);
        } else {
          // For existing users, just show success message and refresh data
          showAlert("Profile updated successfully!", "success");
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
  }, [profileData, showAlert, fetchUserData, isNewUser, router]);

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

              {/* Welcome Banner for New Users */}
              {(!profileData.firstName || profileData.firstName === "User" || 
                !profileData.mobileNumber || profileData.mobileNumber === "Not provided") && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-[#DB4444] to-[#c13a3a] text-white p-6 rounded-xl mb-8 shadow-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 p-3 rounded-full">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">Welcome to Nuvante! 🎉</h2>
                      <p className="text-white/90">Complete your profile below to start shopping and enjoy personalized recommendations.</p>
                      <p className="text-white/80 text-sm mt-1">After saving, you'll be redirected to our homepage to start exploring!</p>
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="flex justify-between items-start mb-8">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
                  {/* Check if this looks like a new signup */}
                  {(!profileData.firstName || profileData.firstName === "User" || 
                    !profileData.mobileNumber || profileData.mobileNumber === "Not provided") && (
                    <p className="text-gray-600 mt-2">Complete your profile to get started with Nuvante</p>
                  )}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-6 py-3 bg-[#DB4444] text-white rounded-lg hover:bg-black transition-all duration-300"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </motion.button>
              </div>

              <ProfileForm
                firstName={profileData.firstName}
                lastName={profileData.lastName}
                mobileNumber={profileData.mobileNumber}
                email={profileData.email}
                isNewUser={isNewUser}
                onFirstNameChange={(value) => setProfileData(prev => ({ ...prev, firstName: value }))}
                onLastNameChange={(value) => setProfileData(prev => ({ ...prev, lastName: value }))}
                onMobileNumberChange={(value) => setProfileData(prev => ({ ...prev, mobileNumber: value }))}
                onSave={updateProfile}
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
