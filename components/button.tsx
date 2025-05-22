"use client";
import React, { useState, useEffect } from "react";

interface ButtonProps {
  text: string;
  width: number;
  onClick?: () => void;
}

const Button = ({ text, width, onClick }: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="bg-[#DB4444] text-white py-3 px-6 rounded-md hover:bg-[#c13a3a] transition-colors duration-200"
      style={{ width: `${width}px` }}
    >
      {text}
    </button>
  );
};

export default Button;
