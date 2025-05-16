"use client";
import React, { useState, useEffect } from "react";

const Button = ({ text, width }: { text: string; width: number }) => {
  return (
    <button
      style={{
        width: `${width}px`,
      }}
      className="p-2 h-[50px] text-white bg-[black] rounded-sm font-bold"
    >
      {text}
    </button>
  );
};

export default Button;
