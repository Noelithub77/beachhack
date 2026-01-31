"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { BoxesContainer } from "./BoxesContainer";
import { Logo } from "./Logo";
import Link from "next/link";

interface HeroProps {
  showIntro?: boolean;
}

export const Hero = ({ showIntro = false }: HeroProps) => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 bg-neutral-100">
      {/* Radial mask for spotlight effect on light background */}
      <div className="absolute inset-0 w-full h-full bg-neutral-100 z-20 [mask-image:radial-gradient(transparent,white)] pointer-events-none" />

      <BoxesContainer />

      {/* Splash Screen Overlay */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            <div className="relative">
              <motion.div
                initial={{ opacity: 1 }}
                exit={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Logo
                  className="w-32 h-32 md:w-48 md:h-48"
                  size={128}
                  animate={true}
                />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 text-center z-30 relative">
        {/* Badge with Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={
            !showIntro ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }
          }
          transition={{ duration: 0.8, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-200 bg-white/50 backdrop-blur-sm mb-8 shadow-sm pr-4"
        >
          <Logo size={16} animate={false} className="h-4 w-auto" />
          <span className="text-xs font-semibold text-neutral-600 tracking-wider uppercase">
            Context-Oriented Customer Operations
          </span>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={!showIntro ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-5xl md:text-7xl font-semibold tracking-tight text-neutral-900 mb-8 leading-[1.05]"
        >
          Customers should never have to{" "}
          <span className="relative text-sage-600 inline-block">
            start over.
          </span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={!showIntro ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-lg md:text-xl text-neutral-600 max-w-2xl mx-auto leading-relaxed"
        >
          A single, continuous record of your customer's journey. COCO
          eliminates friction by ensuring every interaction begins exactly where
          the last one ended.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={!showIntro ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/login">
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="px-8 py-4 bg-neutral-900 text-white font-medium rounded-md hover:bg-neutral-800 transition-colors shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer"
            >
              Get Started
              <motion.span
                className="inline-block"
                whileHover={{ x: 4 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <ArrowRight size={18} />
              </motion.span>
            </motion.button>
          </Link>
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="px-8 py-4 bg-white border border-neutral-200 text-neutral-700 font-medium rounded-md hover:bg-neutral-50 hover:border-neutral-300 transition-colors shadow-xs hover:shadow-sm cursor-pointer"
          >
            Read the Manifesto
          </motion.button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={!showIntro ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="grid grid-cols-3 gap-8 mt-20 pt-8 border-t border-neutral-200"
        >
          {[
            { value: "100%", label: "Context Preserved" },
            { value: "3×", label: "Faster Resolution" },
            { value: "Zero", label: "Lost Conversations" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="text-center group cursor-default"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <div className="text-2xl md:text-3xl font-semibold text-neutral-900 group-hover:text-sage-600 transition-colors">
                {stat.value}
              </div>
              <div className="text-xs text-neutral-500 mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};
