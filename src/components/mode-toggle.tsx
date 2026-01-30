"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useModeAnimation, ThemeAnimationType } from "react-theme-switch-animation";

export function ModeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  const { ref, toggleSwitchTheme } = useModeAnimation({
    animationType: ThemeAnimationType.CIRCLE,
    duration: 500,
    easing: "ease-in-out",
    isDarkMode: resolvedTheme === "dark",
    onDarkModeChange: (isDark) => setTheme(isDark ? "dark" : "light"),
  });

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="outline" size="icon">
        <Sun className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  return (
    <Button ref={ref} variant="outline" size="icon" onClick={toggleSwitchTheme}>
      {resolvedTheme === "dark" ? (
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem]" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
