"use client";
import React from "react";
import { twMerge } from "tailwind-merge";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  onClick?: () => void; // opsional tapi eksplisit
}

export default function Button({
  label,
  className = "",
  onClick,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      onClick={onClick}
      className={twMerge(
        `w-full py-3 rounded-2xl font-semibold text-lg text-white text-center 
        transition-all duration-200 bg-primary hover:bg-primary/70 
        active:scale-[0.98] shadow-md hover:shadow-lg active:shadow-sm 
        active:opacity-10 cursor-pointer font-sans`,
        className
      )}
    >
      {label}
    </button>
  );
}
