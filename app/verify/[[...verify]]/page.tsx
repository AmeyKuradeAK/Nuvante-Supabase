"use client";
import React from "react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useAlert } from "@/context/AlertContext";
import { motion } from "framer-motion";

// Memoize the verification form component
const VerificationForm = React.memo(({ 
  onSubmit, 
  onResendCode, 
  isLoading, 
  code, 
  setCode 
}: { 
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onResendCode: () => Promise<void>;
  isLoading: boolean;
  code: string;
  setCode: (code: string) => void;
}) => (
  <form onSubmit={onSubmit} className="space-y-6">
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.1 }}
    >
      <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
        Verification Code
      </label>
      <motion.input
        whileFocus={{ scale: 1.01 }}
        id="code"
        name="code"
        type="text"
        required
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DB4444] focus:border-[#DB4444] transition-all text-center text-2xl tracking-widest"
        placeholder="Enter code"
        maxLength={6}
      />
    </motion.div>

    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      type="submit"
      disabled={isLoading}
      className="w-full bg-[#DB4444] text-white py-3 px-4 rounded-lg hover:bg-[#c13a3a] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium"
    >
      {isLoading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center"
        >
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Verifying...
        </motion.div>
      ) : (
        "Verify Email"
      )}
    </motion.button>

    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="text-center mt-6"
    >
      <p className="text-gray-600">
        Didn't receive the code?{" "}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={onResendCode}
          className="text-[#DB4444] hover:text-[#c13a3a] transition-colors font-medium"
        >
          Resend Code
        </motion.button>
      </p>
    </motion.div>
  </form>
));

VerificationForm.displayName = 'VerificationForm';

const VerifyPage = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [code, setCode] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();
  const { showAlert } = useAlert();

  const handleVerify = React.useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setIsLoading(true);
    try {
      const result = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        showAlert("Email verified successfully!", "success");
        setTimeout(() => {
          router.push("/Profile");
        }, 1000);
      } else {
        console.error(JSON.stringify(result, null, 2));
        showAlert("Verification process incomplete", "error");
      }
    } catch (err: any) {
      console.error(err);
      showAlert(err.errors[0].message, "error");
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, signUp, setActive, code, showAlert, router]);

  const handleResendCode = React.useCallback(async () => {
    if (!isLoaded) return;
    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      showAlert("New verification code sent!", "success");
    } catch (err: any) {
      showAlert(err.errors[0].message, "error");
    }
  }, [isLoaded, signUp, showAlert]);

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
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300"
            >
              <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-center mb-8"
              >
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Your Email</h1>
                <p className="text-gray-600">Enter the verification code sent to your email</p>
              </motion.div>
              <VerificationForm
                onSubmit={handleVerify}
                onResendCode={handleResendCode}
                isLoading={isLoading}
                code={code}
                setCode={setCode}
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default VerifyPage; 