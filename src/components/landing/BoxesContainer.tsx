"use client";

import React from "react";
import { motion } from "framer-motion";

const colors = [
  "#DCE8DD", // sage-100
  "#B8D1BA", // sage-200
  "#8FB898", // sage-300
  "#EDE8DF", // earth-100
  "#D9CFC0", // earth-200
  "#C2B49E", // earth-300
];

const BackgroundBoxChild = React.memo(() => {
  const randomColor = React.useMemo(
    () => colors[Math.floor(Math.random() * colors.length)],
    [],
  );

  return (
    <motion.div
      className="w-full h-full"
      whileHover={{
        backgroundColor: randomColor,
        transition: { duration: 0 },
      }}
      animate={{
        backgroundColor: "rgba(0,0,0,0)",
      }}
    />
  );
});

BackgroundBoxChild.displayName = "BackgroundBoxChild";

export const BoxesContainer = () => {
  // Increased grid size to ensure full coverage
  const rows = new Array(60).fill(1); // Horizontal axis items
  const cols = new Array(50).fill(1); // Vertical axis items

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-neutral-100 z-0 pointer-events-none">
      <div className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          style={{
            transform: `translate(-5%, -20%) skewX(-48deg) skewY(14deg) scale(0.675) rotate(0deg) translateZ(0)`,
          }}
          className="flex flex-row -ml-24"
        >
          {rows.map((_, i) => (
            <motion.div
              key={`row` + i}
              className="w-16 border-l border-neutral-300/40 relative"
            >
              {cols.map((_, j) => (
                <motion.div
                  key={`col` + j}
                  className="w-16 h-8 border-r border-t border-neutral-300/40 relative"
                >
                  <BackgroundBoxChild />
                  {j % 2 === 0 && i % 2 === 0 ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="absolute h-6 w-10 -top-[14px] -left-[22px] text-neutral-400/30 stroke-[1px] pointer-events-none"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6v12m6-6H6"
                      />
                    </svg>
                  ) : null}
                </motion.div>
              ))}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};
