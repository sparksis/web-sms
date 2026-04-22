"use client";

import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "neutral";
}

const Badge: React.FC<BadgeProps> = ({ children, variant = "primary" }) => {
  const variants = {
    primary: "bg-primary text-white",
    secondary: "bg-primary-variant text-white",
    neutral: "bg-zinc-200 text-zinc-800",
  };

  return (
    <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none rounded-full ${variants[variant]}`}>
      {children}
    </span>
  );
};

export default Badge;
