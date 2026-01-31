"use client";

import React from "react";
import { motion } from "framer-motion";
import { Brain, Globe, Lock, GitMerge } from "lucide-react";
import { Section } from "./Section";

const features = [
  {
    icon: Brain,
    iconColor: "text-earth-600 group-hover:bg-earth-100",
    title: "The Context Engine",
    description:
      "Unstructured conversations are transformed into structured understanding. Confirmed information is clearly distinguished from inferred signals.",
    bar: (
      <div className="h-1 bg-neutral-100 rounded-full overflow-hidden">
        <div className="h-full bg-earth-400 w-3/4"></div>
      </div>
    ),
  },
  {
    icon: Globe,
    iconColor: "text-sage-600 group-hover:bg-sage-100",
    title: "Language & Accessibility",
    description:
      "Voice interactions are transcribed in real time. Meaning is normalized so representatives see consistent context regardless of input language.",
    tags: ["EN", "ES", "FR", "JP"],
  },
  {
    icon: Lock,
    iconColor: "text-neutral-600 group-hover:bg-neutral-200",
    title: "Privacy & Trust",
    description:
      "Sharing context across vendors requires explicit permission. Deletion and restriction controls are clear. Remembering customers never comes at the cost of autonomy.",
  },
  {
    icon: GitMerge,
    iconColor: "text-earth-600 group-hover:bg-earth-100",
    title: "Differentiation",
    description:
      "COCO is a narrative system where tickets are chapters, not isolated cases. Context is curated memory, not raw logs.",
  },
];

export const Features = () => {
  return (
    <Section id="features" className="border-t border-neutral-200">
      {/* Section Header */}
      <div className="mb-12">
        <h2 className="text-3xl md:text-4xl font-semibold mb-6 tracking-tight text-neutral-900">
          The Platform
        </h2>
        <p className="text-neutral-500 max-w-2xl text-lg leading-relaxed">
          Built on principles of continuity and context, COCO's architecture
          ensures every feature works together to eliminate friction.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{
              y: -4,
              transition: { type: "spring", stiffness: 300, damping: 20 },
            }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="bg-white border border-neutral-200 p-8 rounded-xl hover:border-sage-300 hover:shadow-lg transition-all duration-300 shadow-xs group cursor-default"
          >
            <motion.div
              className={`w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center mb-6 transition-colors ${feature.iconColor}`}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <feature.icon size={20} />
            </motion.div>
            <h3 className="text-lg font-semibold mb-3 text-neutral-900">
              {feature.title}
            </h3>
            <p className="text-neutral-500 text-sm leading-relaxed mb-4">
              {feature.description}
            </p>
            {feature.bar}
            {feature.tags && (
              <div className="flex gap-2">
                {feature.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] border border-neutral-200 px-2 py-1 rounded text-neutral-400 font-mono"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </Section>
  );
};
