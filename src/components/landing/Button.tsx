"use client";

import React from "react";
import { motion } from "framer-motion";
import { twMerge } from "tailwind-merge";

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "earth";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  href?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  className,
  onClick,
  href,
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-md transition-all duration-200";

  const variants = {
    primary:
      "bg-sage-500 text-white hover:bg-sage-600 shadow-sm hover:shadow-md",
    secondary:
      "bg-neutral-100 text-neutral-700 border border-neutral-300 hover:bg-neutral-200 hover:border-neutral-400",
    ghost: "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100",
    earth: "bg-earth-100 text-earth-700 hover:bg-earth-200",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const Component = href ? "a" : "button";

  return (
    <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
      <Component
        href={href}
        onClick={onClick}
        className={twMerge(
          baseStyles,
          variants[variant],
          sizes[size],
          className,
        )}
      >
        {children}
      </Component>
    </motion.div>
  );
};
