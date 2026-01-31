"use client";

import React from "react";
import { motion } from "framer-motion";
import { User, Headphones, Building } from "lucide-react";

const outcomes = [
  {
    icon: User,
    title: "Customers feel recognized, not processed",
    description:
      "Every interaction acknowledges their history. No more explaining the same problem twice.",
    iconBg: "bg-sage-100",
    iconColor: "text-sage-600",
  },
  {
    icon: Headphones,
    title: "Support teams feel informed, not overwhelmed",
    description:
      "Clear, structured context replaces endless transcript hunting. Focus on solving, not searching.",
    iconBg: "bg-earth-100",
    iconColor: "text-earth-600",
  },
  {
    icon: Building,
    title: "Organizations gain clarity, not just data",
    description:
      "Insights are grounded in real customer outcomes, driving better decisions across the board.",
    iconBg: "bg-sage-100",
    iconColor: "text-sage-600",
  },
];

export const EndGoal = () => {
  return (
    <section className="py-24 bg-neutral-100 relative ambient-sage">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-semibold text-sage-600 uppercase tracking-wide">
            The End Goal
          </span>
          <h2 className="text-3xl md:text-4xl font-semibold text-neutral-900 mt-3 mb-4 tracking-tight">
            Success is simple to describe
          </h2>
        </motion.div>

        {/* Outcomes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {outcomes.map((outcome, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="text-center p-6 rounded-lg bg-white border border-neutral-200"
            >
              <div
                className={`w-12 h-12 rounded-md ${outcome.iconBg} flex items-center justify-center mx-auto mb-5`}
              >
                <outcome.icon className={`w-6 h-6 ${outcome.iconColor}`} />
              </div>
              <h3 className="text-base font-semibold text-neutral-800 mb-2">
                {outcome.title}
              </h3>
              <p className="text-neutral-500 text-sm">{outcome.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center"
        >
          <div className="inline-block p-8 rounded-xl bg-white border border-neutral-200 shadow-sm">
            <h3 className="text-2xl md:text-3xl font-semibold text-neutral-900 mb-3 tracking-tight">
              Transform support from a cost center
              <br />
              <span className="text-gradient">into a relationship engine</span>
            </h3>
            <p className="text-neutral-500 mb-6 max-w-lg mx-auto text-sm">
              By building a system that truly remembers, COCO creates support
              experiences that build lasting customer relationships.
            </p>
            <motion.a
              href="#"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-sage-500 text-white font-medium text-sm shadow-sm hover:bg-sage-600 transition-colors"
            >
              Start Your Free Trial
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
