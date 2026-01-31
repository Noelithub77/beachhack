"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  MessageCircle,
  Phone,
  Mail,
  FileText,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

const helpOptions = [
  {
    href: "/customer/help/chat",
    icon: MessageCircle,
    title: "AI Chat",
    description: "Get instant help from SAGE, our AI assistant",
    accent: "bg-primary/10 text-primary",
    badge: "Recommended",
  },
  {
    href: "/customer/help/call",
    icon: Phone,
    title: "Voice Call",
    description: "Speak with our AI voice agent or a representative",
    accent: "bg-sage-500/20 text-sage-900",
  },
  {
    href: "#",
    icon: Mail,
    title: "Email Support",
    description: "Send us an email for non-urgent issues",
    accent: "bg-sand/20 text-earth",
  },
  {
    href: "#",
    icon: FileText,
    title: "Help Center",
    description: "Browse FAQs and documentation",
    accent: "bg-muted text-muted-foreground",
  },
];

export default function CustomerHelp() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Get Help</h1>
        <p className="text-muted-foreground">
          Choose how you would like to connect
        </p>
      </div>

      {/* AI first */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-medium text-primary">
            Quick Help with AI
          </h2>
        </div>
        <div className="grid gap-3">
          {helpOptions.slice(0, 2).map((option) => (
            <Link key={option.title} href={option.href}>
              <Card className="cursor-pointer transition-all hover:shadow-soft hover:border-primary/20">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-lg p-2.5 ${option.accent}`}>
                      <option.icon className="h-5 w-5" strokeWidth={1.5} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{option.title}</p>
                        {option.badge && (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            {option.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {option.description}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* other options */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">
          Other Options
        </h2>
        <div className="grid gap-3">
          {helpOptions.slice(2).map((option) => (
            <Link key={option.title} href={option.href}>
              <Card className="cursor-pointer transition-all hover:shadow-soft">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-lg p-2.5 ${option.accent}`}>
                      <option.icon className="h-5 w-5" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="font-medium">{option.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {option.description}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
