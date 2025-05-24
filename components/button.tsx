"use client";
import React, { useState, useEffect } from "react";

interface ButtonProps {
  text: string;
  width?: number;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

const Button = ({ text, width = 200, onClick, disabled = false, className = '' }: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-[${width}px] bg-[#DB4444] text-white font-medium py-2.5 px-4 rounded-md hover:bg-black transition-colors duration-200 ${className}`}
    >
      {text}
    </button>
  );
};

export default Button;
