"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { Alert } from "@/components/ui/Alert";

interface AlertContextType {
  showAlert: (message: string, type?: "info" | "warning" | "error" | "success") => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [alert, setAlert] = useState<{
    message: string;
    type: "info" | "warning" | "error" | "success";
  } | null>(null);

  const showAlert = useCallback((message: string, type: "info" | "warning" | "error" | "success" = "info") => {
    setAlert({ message, type });
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      {alert && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
} 