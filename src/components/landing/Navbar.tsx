"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import Link from "next/link";

const navItems = [
  { name: "Philosophy", href: "#philosophy" },
  { name: "For Teams", href: "#for-teams" },
  { name: "Platform", href: "#features" },
];

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 py-6 md:px-12 transition-all duration-300 ${
          isScrolled
            ? "backdrop-blur-md bg-neutral-100/80 border-b border-neutral-200"
            : "bg-transparent"
        }`}
      >
        {/* Logo */}
        <a
          href="#"
          className="font-bold text-xl tracking-tight text-neutral-900 flex items-center gap-3"
        >
          <Logo className="h-8 w-auto" animate={true} size={28} />
          COCO
        </a>

        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-8 text-sm font-medium text-neutral-600">
          {navItems.map((item, index) => (
            <motion.a
              key={item.name}
              href={item.href}
              className="hover:text-sage-700 transition-colors relative"
              whileHover={{ y: -1 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              {item.name}
              <motion.span
                className="absolute -bottom-1 left-0 w-0 h-0.5 bg-sage-500 rounded-full"
                whileHover={{ width: "100%" }}
                transition={{ duration: 0.2 }}
              />
            </motion.a>
          ))}
        </div>

        {/* CTA Button */}
        <Link href="/login">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="hidden md:block text-sm font-medium bg-neutral-900 text-white px-5 py-2.5 rounded-md hover:bg-neutral-800 transition-colors shadow-sm cursor-pointer"
          >
            Login
          </motion.button>
        </Link>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-neutral-700"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-neutral-100/98 backdrop-blur-xl pt-24 md:hidden"
          >
            <div className="flex flex-col items-center gap-6 p-6">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-lg text-neutral-700 hover:text-sage-600 transition-colors"
                >
                  {item.name}
                </a>
              ))}
              <Link href="/login" className="mt-6 w-full">
                <button className="w-full max-w-xs text-sm font-medium bg-neutral-900 text-white px-5 py-3 rounded-md hover:bg-neutral-800 transition-colors">
                  Login
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
