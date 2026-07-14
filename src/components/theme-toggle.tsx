"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/components/theme-provider";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isLight = mounted && theme === "light";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={className}
      title={isLight ? "Mudar para tema escuro" : "Mudar para tema claro"}
      onClick={() => setTheme(isLight ? "dark" : "light")}
    >
      {mounted ? isLight ? <Sun className="size-4" /> : <Moon className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}
