"use client";

import React from "react";
import { motion } from "framer-motion";
import { Database, Infinity, BrainCircuit } from "lucide-react";
import { Section } from "./Section";

const principles = [
  {
    icon: Database,
    title: "One System of Record",
    description:
      "Every customer issue becomes a single authoritative ticket. Whether it's chat, voice, or email, there are no parallel threads.",
  },
  {
    icon: Infinity,
    title: "Continuity by Default",
    description:
      "Context isn't hunted for; it flows. It is continuously captured, summarized, and carried forward automatically.",
  },
  {
    icon: BrainCircuit,
    title: "AI as Assistant",
    description:
      "Intelligence organizes information and detects intent to reduce friction. Humans retain authority over decisions.",
  },
];

export const Philosophy = () => {
  return (
    <Section id="philosophy" className="border-t border-neutral-200">
      <div className="mb-20">
        <h2 className="text-3xl md:text-4xl font-semibold mb-6 tracking-tight text-neutral-900">
          The Philosophy
        </h2>
        <p className="text-neutral-500 max-w-2xl text-lg leading-relaxed">
          COCO is built on three simple, non-negotiable ideas that transform
          support from a cost center into a relationship engine.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {principles.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{
              y: -4,
              transition: { type: "spring", stiffness: 300, damping: 20 },
            }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
            className="p-8 rounded-xl bg-white border border-neutral-200 shadow-xs hover:shadow-lg transition-shadow duration-300 group cursor-default"
          >
            <motion.div
              className="w-12 h-12 rounded-lg bg-neutral-50 border border-neutral-100 flex items-center justify-center mb-6 text-neutral-700 transition-all duration-300 group-hover:text-sage-600 group-hover:border-sage-200 group-hover:bg-sage-50"
              whileHover={{
                rotate: [0, -10, 10, 0],
                transition: { duration: 0.5 },
              }}
            >
              <card.icon size={24} />
            </motion.div>
            <h3 className="text-lg font-semibold mb-3 text-neutral-900">
              {card.title}
            </h3>
            <p className="text-neutral-500 leading-relaxed text-sm">
              {card.description}
            </p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
};
