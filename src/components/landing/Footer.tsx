"use client";

import React from "react";
import { Section } from "./Section";
import { Logo } from "./Logo";

export const Footer = () => {
  return (
    <footer className="border-t border-neutral-200 bg-white pt-24 pb-12">
      <Section className="py-0">
        {/* End Goal Section */}
        <div className="max-w-3xl mx-auto text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-semibold mb-12 tracking-tight text-neutral-900">
            The End Goal
          </h2>

          <div className="space-y-6 text-xl md:text-2xl text-neutral-400 font-light leading-normal">
            <p>
              Customers feel{" "}
              <span className="text-sage-600 font-medium border-b border-sage-200">
                recognized
              </span>
              , not processed.
            </p>
            <p>
              Support teams feel{" "}
              <span className="text-earth-500 font-medium border-b border-earth-200">
                informed
              </span>
              , not overwhelmed.
            </p>
            <p>
              Organizations gain{" "}
              <span className="text-neutral-900 font-medium border-b border-neutral-200">
                clarity
              </span>
              , not just data.
            </p>
          </div>

          <div className="mt-16 pt-16 border-t border-neutral-100">
            <p className="text-neutral-500 text-sm">
              By building a system that truly remembers, COCO transforms support
              from a cost center into a relationship engine.
            </p>
          </div>
        </div>

        {/* Footer Links */}
        <div className="flex flex-col md:flex-row justify-between items-center text-xs text-neutral-500 mt-12 font-medium">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <Logo size={18} animate={false} />
            <p>
              &copy; {new Date().getFullYear()} COCO Platform. All rights
              reserved.
            </p>
          </div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-sage-700 transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-sage-700 transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-sage-700 transition-colors">
              Contact
            </a>
          </div>
        </div>
      </Section>
    </footer>
  );
};
