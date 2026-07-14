"use client";

import { useTheme } from "@/components/theme-provider";
import { Toaster as Sonner } from "sonner";

function Toaster(props: React.ComponentProps<typeof Sonner>) {
  const { theme } = useTheme();

  return (
    <Sonner
      theme={theme === "light" ? "light" : "dark"}
      position="top-right"
      toastOptions={{
        style: {
          background: "var(--surface-raised)",
          color: "var(--foreground)",
          border: "1px solid var(--border-strong)",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
