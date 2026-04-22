"use client";

import React from "react";

interface AvatarProps {
  name?: string;
  src?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ name, src, size = "md", className = "" }) => {
  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
  };

  const getInitials = (n?: string) => {
    if (!n) return "?";
    return n.split(" ").map(p => p[0]).join("").toUpperCase().slice(0, 2);
  };

  const stringToColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00ffffff).toString(16).toUpperCase();
    return "#" + "00000".substring(0, 6 - c.length) + c;
  };

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizes[size]} rounded-full object-cover ${className}`}
      />
    );
  }

  const initials = getInitials(name);
  const bgColor = name ? stringToColor(name) : "#B71C1C";

  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center text-white font-bold overflow-hidden ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      {initials}
    </div>
  );
};

export default Avatar;
