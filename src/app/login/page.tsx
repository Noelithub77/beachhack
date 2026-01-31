"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/auth-store";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { User, Headphones, Shield } from "lucide-react";

// Dynamic import with SSR disabled to prevent hydration mismatch
const BackgroundRippleEffect = dynamic(
  () => import("@/components/ui/background-ripple-effect").then(mod => mod.BackgroundRippleEffect),
  { ssr: false }
);

const demoAccounts = [
  { email: "customer@coco.com", role: "Customer", icon: User },
  { email: "rep.l1@coco.com", role: "Rep L1", icon: Headphones },
  { email: "rep.l2@coco.com", role: "Rep L2", icon: Headphones },
  { email: "admin.manager@coco.com", role: "Admin", icon: Shield },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const setUser = useAuthStore((s) => s.setUser);
  const login = useMutation(api.functions.auth.login);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login({ email, password });
      if (result.success && result.user) {
        setUser(result.user);
        const role = result.user.role;
        if (role === "customer") {
          router.push("/customer/dashboard");
        } else if (role.startsWith("rep")) {
          router.push("/rep/inbox");
        } else {
          router.push("/admin/dashboard");
        }
      } else {
        setError(result.error || "Invalid credentials");
      }
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (email: string) => {
    setEmail(email);
    setPassword("password");
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 overflow-hidden bg-[#f4f4f4]">
      <BackgroundRippleEffect />
      
      <Card 
        className="relative z-10 w-full max-w-md overflow-hidden border-0 shadow-2xl shadow-[#6f8551]/10 backdrop-blur-sm"
        style={{
          background: `
            radial-gradient(circle at 0% 0%, rgba(183, 207, 154, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 100% 100%, rgba(111, 133, 81, 0.06) 0%, transparent 50%),
            linear-gradient(to bottom, rgba(255,255,255,0.98), rgba(250,252,248,0.95))
          `
        }}
      >
        {/* Decorative top accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#b7cf9a] via-[#6f8551] to-[#b7cf9a]" />
        
        <CardHeader className="space-y-4 text-center pt-8 pb-2">
          {/* COCO Logo */}
          <div className="mx-auto flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#b7cf9a] to-[#6f8551] rounded-2xl blur-xl opacity-30 animate-pulse" />
              <div className="relative flex h-20 w-20 items-center justify-center">
                <svg width="48" height="72" viewBox="0 0 34 58" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M28.8 4.8C22.4348 4.8 16.3303 7.32857 11.8294 11.8294C7.32855 16.3303 4.79999 22.4348 4.79999 28.8C4.79999 35.1652 7.32855 41.2697 11.8294 45.7706C16.3303 50.2714 22.4348 52.8 28.8 52.8" stroke="#7A9174" strokeWidth="9.6" strokeLinecap="round"/>
                  <path d="M4.79999 52.8C11.1652 52.8 17.2697 50.2714 21.7705 45.7706C26.2714 41.2697 28.8 35.1652 28.8 28.8C28.8 22.4348 26.2714 16.3303 21.7705 11.8294C17.2697 7.32857 11.1652 4.8 4.79999 4.8" stroke="#2D3E2F" strokeWidth="9.6" strokeLinecap="round"/>
                </svg>
              </div>
            </div>
          </div>
          
          {/* Title with gradient */}
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-[#4a5a38] via-[#6f8551] to-[#4a5a38] bg-clip-text text-transparent">
              COCO
            </h1>
            <p className="text-sm text-muted-foreground font-medium">
              Context Oriented Customer Ops
            </p>
          </div>
          
          {/* Welcome message */}
          <p className="text-xs text-muted-foreground/80 max-w-[280px] mx-auto">
            Streamline your customer support with AI-powered insights
          </p>
        </CardHeader>
        
        <CardContent className="px-6 pb-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground/80">
                Email
              </Label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-[#6f8551] transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="16" x="2" y="4" rx="2"/>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 pl-10 bg-white/60 border-[#6f8551]/15 rounded-xl shadow-sm shadow-[#6f8551]/5 focus:border-[#6f8551]/40 focus:ring-2 focus:ring-[#6f8551]/10 focus:bg-white transition-all placeholder:text-muted-foreground/40"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-foreground/80">
                Password
              </Label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-[#6f8551] transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 pl-10 bg-white/60 border-[#6f8551]/15 rounded-xl shadow-sm shadow-[#6f8551]/5 focus:border-[#6f8551]/40 focus:ring-2 focus:ring-[#6f8551]/10 focus:bg-white transition-all placeholder:text-muted-foreground/40"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-11 bg-gradient-to-r from-[#6f8551] to-[#5a6d42] hover:from-[#5a6d42] hover:to-[#4a5a38] shadow-lg shadow-[#6f8551]/25 transition-all duration-300" 
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Demo accounts section */}
          <div className="mt-8 pt-6 border-t border-muted-foreground/10">
            <p className="mb-4 text-center text-xs text-muted-foreground">
              Quick access • Password: <code className="px-1.5 py-0.5 rounded bg-muted text-[#6f8551] font-mono">password</code>
            </p>
            <div className="grid grid-cols-3 gap-2">
              {demoAccounts.map((acc) => {
                const Icon = acc.icon;
                return (
                  <Button
                    key={acc.email}
                    variant="outline"
                    size="sm"
                    onClick={() => fillDemo(acc.email)}
                    className="flex flex-col items-center gap-1.5 h-auto py-3 hover:bg-[#6f8551]/5 hover:border-[#6f8551]/30 transition-all group"
                  >
                    <Icon className="h-4 w-4 text-muted-foreground group-hover:text-[#6f8551] transition-colors" />
                    <span className="text-xs font-medium">{acc.role}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

