"use client";

import { motion } from "framer-motion";

interface LogoProps {
  size?: number;
  animate?: boolean;
  className?: string;
}

// Spring transition for the "boomerang" snap effect
const springTransition = {
  type: "spring",
  stiffness: 200,
  damping: 12,
  mass: 0.8,
  delay: 0.2,
};

export const Logo = ({
  size = 34,
  animate = true,
  className = "",
}: LogoProps) => {
  const height = (size / 34) * 58;

  if (!animate) {
    return (
      <svg
        width={size}
        height={height}
        viewBox="0 0 34 58"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <path
          d="M28.8 4.8C22.4348 4.8 16.3303 7.32857 11.8294 11.8294C7.32855 16.3303 4.79999 22.4348 4.79999 28.8C4.79999 35.1652 7.32855 41.2697 11.8294 45.7706C16.3303 50.2714 22.4348 52.8 28.8 52.8"
          stroke="#7A9174"
          strokeWidth="9.6"
          strokeLinecap="round"
        />
        <path
          d="M4.79999 52.8C11.1652 52.8 17.2697 50.2714 21.7705 45.7706C26.2714 41.2697 28.8 35.1652 28.8 28.8C28.8 22.4348 26.2714 16.3303 21.7705 11.8294C17.2697 7.32857 11.1652 4.8 4.79999 4.8"
          stroke="#2D3E2F"
          strokeWidth="9.6"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <motion.svg
      width={size}
      height={height}
      viewBox="0 0 34 58"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="COCO Logo"
    >
      {/* Right Bracket (Lighter Sage) - Moves in from Right */}
      <motion.path
        d="M28.8 4.8C22.4348 4.8 16.3303 7.32857 11.8294 11.8294C7.32855 16.3303 4.79999 22.4348 4.79999 28.8C4.79999 35.1652 7.32855 41.2697 11.8294 45.7706C16.3303 50.2714 22.4348 52.8 28.8 52.8"
        stroke="#7A9174"
        strokeWidth="9.6"
        strokeLinecap="round"
        initial={animate ? { x: 40, opacity: 0, rotate: 20 } : {}}
        animate={animate ? { x: 0, opacity: 1, rotate: 0 } : {}}
        transition={springTransition}
      />
      {/* Left Bracket (Darker Green) - Moves in from Left */}
      <motion.path
        d="M4.79999 52.8C11.1652 52.8 17.2697 50.2714 21.7705 45.7706C26.2714 41.2697 28.8 35.1652 28.8 28.8C28.8 22.4348 26.2714 16.3303 21.7705 11.8294C17.2697 7.32857 11.1652 4.8 4.79999 4.8"
        stroke="#2D3E2F"
        strokeWidth="9.6"
        strokeLinecap="round"
        initial={animate ? { x: -40, opacity: 0, rotate: -20 } : {}}
        animate={animate ? { x: 0, opacity: 1, rotate: 0 } : {}}
        transition={springTransition}
      />
    </motion.svg>
  );
};

// Hover animation version for navbar
export const LogoInteractive = ({
  size = 28,
  className = "",
}: Omit<LogoProps, "animate">) => {
  const height = (size / 34) * 58;

  return (
    <motion.svg
      width={size}
      height={height}
      viewBox="0 0 34 58"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      whileHover="hover"
      initial="idle"
    >
      {/* Right curve */}
      <motion.path
        d="M28.8 4.8C22.4348 4.8 16.3303 7.32857 11.8294 11.8294C7.32855 16.3303 4.79999 22.4348 4.79999 28.8C4.79999 35.1652 7.32855 41.2697 11.8294 45.7706C16.3303 50.2714 22.4348 52.8 28.8 52.8"
        stroke="#7A9174"
        strokeWidth="9.6"
        strokeLinecap="round"
        variants={{
          idle: { x: 0, rotate: 0 },
          hover: {
            x: 3,
            rotate: 5,
            transition: { duration: 0.3, ease: "easeOut" },
          },
        }}
      />
      {/* Left curve */}
      <motion.path
        d="M4.79999 52.8C11.1652 52.8 17.2697 50.2714 21.7705 45.7706C26.2714 41.2697 28.8 35.1652 28.8 28.8C28.8 22.4348 26.2714 16.3303 21.7705 11.8294C17.2697 7.32857 11.1652 4.8 4.79999 4.8"
        stroke="#2D3E2F"
        strokeWidth="9.6"
        strokeLinecap="round"
        variants={{
          idle: { x: 0, rotate: 0 },
          hover: {
            x: -3,
            rotate: -5,
            transition: { duration: 0.3, ease: "easeOut" },
          },
        }}
      />
    </motion.svg>
  );
};
