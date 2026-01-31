"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Headphones, ShieldCheck } from "lucide-react";
import { Section } from "./Section";

interface TabContent {
  id: string;
  label: string;
  icon: React.ElementType;
  content: React.ReactNode;
}

export const ForTeams = () => {
  const [activeTab, setActiveTab] = useState("customers");

  const tabs: TabContent[] = [
    {
      id: "customers",
      label: "Customers",
      icon: User,
      content: (
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-2xl font-semibold mb-4 text-neutral-900 tracking-tight">
              Frictionless Resolution
            </h3>
            <p className="text-neutral-500 mb-8 text-lg leading-relaxed">
              Customers can view active issues, revisit past conversations, and
              track progress in one place. Switch from chat to voice
              mid-conversation without repeating a single detail.
            </p>
            <ul className="space-y-4 text-neutral-700 text-sm font-medium">
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-sage-500"></span>
                <span>View active issues & track progress centrally</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-sage-500"></span>
                <span>Switch channels seamlessly (Chat → Voice → Email)</span>
              </li>
        
            </ul>
          </div>
          {/* Mock Chat Interface */}
          <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-200 shadow-md relative overflow-hidden">
            <div className="space-y-6 relative z-10">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-md bg-neutral-200 flex-shrink-0" />
                <div className="bg-white border border-neutral-200 p-4 rounded-xl rounded-tl-none max-w-[85%] text-sm text-neutral-600 shadow-sm">
                  Hi, I'm calling about the issue I chatted about last Tuesday.
                </div>
              </div>
              <div className="flex gap-4 flex-row-reverse">
                <div className="w-8 h-8 rounded-md bg-sage-600 flex-shrink-0" />
                <div className="bg-sage-50 border border-sage-100 p-4 rounded-xl rounded-tr-none max-w-[85%] text-sm text-sage-900 shadow-sm">
                  Welcome back, Sarah. I have that context right here. You were
                  discussing the billing cycle adjustment, correct?
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-md bg-neutral-200 flex-shrink-0" />
                <div className="bg-white border border-neutral-200 p-4 rounded-xl rounded-tl-none max-w-[85%] text-sm text-neutral-600 shadow-sm">
                  Exactly. Thank you for remembering.
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "reps",
      label: "Support Reps",
      icon: Headphones,
      content: (
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-2xl font-semibold mb-4 text-neutral-900 tracking-tight">
              Curated Context, Not Raw Logs
            </h3>
            <p className="text-neutral-500 mb-8 text-lg leading-relaxed">
              Representatives work from a unified inbox. Instead of digging
              through raw transcripts, they see curated summaries separating
              facts from assumptions.
            </p>
            <ul className="space-y-4 text-neutral-700 text-sm font-medium">
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-earth-500"></span>
                <span>Unified inbox for all channels</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-earth-500"></span>
                <span>AI-generated summaries of history & intent</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-earth-500"></span>
                <span>Smooth handoffs with structured context</span>
              </li>
            </ul>
          </div>
          {/* Mock Context Card */}
          <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-200 shadow-md relative">
            <div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                  Customer Context
                </span>
                <span className="text-[10px] bg-sage-100 text-sage-700 px-2 py-1 rounded-full font-medium">
                  High Value
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm border-b border-neutral-100 pb-2">
                  <span className="text-neutral-400">Intent</span>
                  <span className="text-neutral-900 font-medium">
                    Billing Modification
                  </span>
                </div>
                <div className="flex justify-between text-sm border-b border-neutral-100 pb-2">
                  <span className="text-neutral-400">Sentiment</span>
                  <span className="text-sage-600 font-medium">
                    Positive (Improving)
                  </span>
                </div>
                <div className="flex justify-between text-sm pt-1">
                  <span className="text-neutral-400">Last Agent</span>
                  <span className="text-neutral-900 font-medium">
                    Marcus T. (Voice)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "admins",
      label: "Admins & Managers",
      icon: ShieldCheck,
      content: (
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-2xl font-semibold mb-4 text-neutral-900 tracking-tight">
              Operational Clarity
            </h3>
            <p className="text-neutral-500 mb-8 text-lg leading-relaxed">
              Workload distribution, sentiment analysis, and team performance
              live in one environment. Make decisions based on real
              interactions, not disconnected reports.
            </p>
            <ul className="space-y-4 text-neutral-700 text-sm font-medium">
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-sage-500"></span>
                <span>Real-time workload & sentiment visibility</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-sage-500"></span>
                <span>Integrated quality assurance & scheduling</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-sage-500"></span>
                <span>Outcome-based metrics</span>
              </li>
            </ul>
          </div>
          {/* Mock Dashboard */}
          <div className="bg-neutral-50 rounded-xl p-8 border border-neutral-200 shadow-md relative flex items-center justify-center">
            <div className="w-full relative z-10">
              <div className="flex gap-2 mb-6">
                <div className="h-2 bg-neutral-200 w-1/3 rounded-full overflow-hidden">
                  <div className="h-full bg-sage-500 w-[80%]"></div>
                </div>
                <div className="h-2 bg-neutral-200 w-1/3 rounded-full overflow-hidden">
                  <div className="h-full bg-earth-400 w-[40%]"></div>
                </div>
                <div className="h-2 bg-neutral-200 w-1/3 rounded-full overflow-hidden">
                  <div className="h-full bg-neutral-400 w-[10%]"></div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border border-neutral-200 text-center">
                  <div className="text-2xl font-semibold text-neutral-900">
                    94%
                  </div>
                  <div className="text-[10px] text-neutral-400 uppercase tracking-wide">
                    Resolution
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-neutral-200 text-center">
                  <div className="text-2xl font-semibold text-sage-600">
                    +12%
                  </div>
                  <div className="text-[10px] text-neutral-400 uppercase tracking-wide">
                    Sentiment
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-neutral-200 text-center">
                  <div className="text-2xl font-semibold text-earth-600">
                    2.4m
                  </div>
                  <div className="text-[10px] text-neutral-400 uppercase tracking-wide">
                    Avg Time
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <Section id="for-teams" className="border-t border-neutral-200">
      <div className="mb-12">
        <h2 className="text-3xl md:text-4xl font-semibold mb-6 tracking-tight text-neutral-900">
          Designed for Everyone
        </h2>
        <p className="text-neutral-500 max-w-2xl text-lg leading-relaxed">
          Whether you're seeking help, providing support, or managing
          operations—COCO adapts to your needs.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="inline-flex gap-2 mb-8 bg-neutral-100 p-1.5 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-white text-neutral-900 shadow-sm"
                : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content with elevated card wrapper */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-8 md:p-12 shadow-sm">
        <AnimatePresence mode="wait">
          {tabs.map(
            (tab) =>
              activeTab === tab.id && (
                <motion.div
                  key={tab.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {tab.content}
                </motion.div>
              ),
          )}
        </AnimatePresence>
      </div>
    </Section>
  );
};
