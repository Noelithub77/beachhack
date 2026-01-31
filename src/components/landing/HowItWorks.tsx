"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Section } from "./Section";

const steps = [
  {
    number: "01",
    title: "Customer Reaches Out",
    description:
      "Through any channel—chat, voice, or email—the customer starts a conversation. For common issues, AI-assisted help attempts resolution immediately.",
    highlights: [
      "Multi-channel entry points",
      "AI-powered initial response",
      "Minimal friction onboarding",
    ],
  },
  {
    number: "02",
    title: "Context is Captured",
    description:
      "Every interaction adds to a living customer narrative. Identity, preferences, issue details, and patterns are automatically extracted and structured.",
    highlights: [
      "Real-time transcription",
      "Structured data extraction",
      "Continuous summarization",
    ],
  },
  {
    number: "03",
    title: "Seamless Human Handoff",
    description:
      "When human support is needed, the transition is invisible. The agent receives curated context—not raw logs—with clear facts separated from inferences.",
    highlights: [
      "No repeated explanations",
      "Curated agent briefings",
      "Clear ownership transfer",
    ],
  },
  {
    number: "04",
    title: "Resolution & Learning",
    description:
      "The issue is resolved with full context. The interaction enriches the customer's record, making future support even more personalized and efficient.",
    highlights: [
      "Persistent customer memory",
      "Feedback integration",
      "Continuous improvement",
    ],
  },
];

export const HowItWorks = () => {
  return (
    <Section id="how-it-works" className="border-t border-neutral-200">
      {/* Section header */}
      <div className="mb-16">
        <h2 className="text-3xl md:text-4xl font-semibold text-neutral-900 mb-4 tracking-tight">
          How It Works
        </h2>
        <p className="text-neutral-500 max-w-2xl text-lg leading-relaxed">
          From first contact to resolution, context flows forward automatically.
        </p>
      </div>

      {/* Steps */}
      <div className="relative">
        {/* Connecting line */}
        <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-sage-300 via-earth-300 to-sage-300" />

        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`relative flex flex-col md:flex-row items-start md:items-center gap-8 mb-12 ${
              index % 2 === 1 ? "md:flex-row-reverse" : ""
            }`}
          >
            {/* Number bubble - mobile */}
            <div className="absolute left-0 w-12 h-12 rounded-lg bg-sage-500 flex items-center justify-center text-white font-semibold text-sm shadow-sm z-10 md:hidden">
              {step.number}
            </div>

            {/* Number bubble - desktop */}
            <div className="absolute left-1/2 -translate-x-1/2 w-12 h-12 rounded-lg bg-sage-500 items-center justify-center text-white font-semibold text-sm shadow-sm z-10 hidden md:flex">
              {step.number}
            </div>

            {/* Content card */}
            <div
              className={`w-full md:w-[calc(50%-4rem)] pl-16 md:pl-0 ${
                index % 2 === 0 ? "md:pr-8" : "md:pl-8"
              }`}
            >
              <motion.div
                whileHover={{ y: -2 }}
                className="p-6 rounded-xl bg-white border border-neutral-200 shadow-xs hover:shadow-md transition-all duration-200"
              >
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-neutral-500 text-sm mb-4 leading-relaxed">
                  {step.description}
                </p>
                <ul className="space-y-2">
                  {step.highlights.map((highlight, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-xs text-neutral-600"
                    >
                      <Check className="w-3.5 h-3.5 text-sage-500 flex-shrink-0" />
                      {highlight}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>

            {/* Spacer for alternating layout */}
            <div className="hidden md:block w-[calc(50%-4rem)]" />
          </motion.div>
        ))}
      </div>
    </Section>
  );
};
