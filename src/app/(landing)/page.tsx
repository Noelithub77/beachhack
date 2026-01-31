"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import {
  Navbar,
  Hero,
  Philosophy,
  HowItWorks,
  ForTeams,
  Features,
  Footer,
} from "@/components/landing";

export default function Home() {
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    // Duration includes the logo animation + a moment of pause before fading out
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 2800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="min-h-screen bg-neutral-100 text-neutral-900 selection:bg-sage-200 selection:text-sage-900">
      {/* Navigation - Fades in after intro */}
      <AnimatePresence>{!showIntro && <Navbar />}</AnimatePresence>

      <Hero showIntro={showIntro} />
      <Philosophy />
      <HowItWorks />
      <ForTeams />
      <Features />
      <Footer />
    </main>
  );
}
