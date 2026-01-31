"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/auth-store";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

const demoAccounts = [
  { email: "customer@coco.com", role: "Customer" },
  { email: "rep.l1@coco.com", role: "Rep L1" },
  { email: "admin.manager@coco.com", role: "Admin" },
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
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-semibold">COCO</CardTitle>
          <CardDescription>Context Oriented Customer Ops</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 border-t pt-4">
            <p className="mb-3 text-center text-xs text-muted-foreground">
              Demo accounts (password: password)
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {demoAccounts.map((acc) => (
                <Button
                  key={acc.email}
                  variant="outline"
                  size="sm"
                  onClick={() => fillDemo(acc.email)}
                >
                  {acc.role}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
