"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div
        className={`w-10 h-10 rounded-xl ${className}`}
        style={{ background: "var(--bg-2)" }}
        aria-hidden
      />
    );
  }

  const cycle = () => {
    if (theme === "dark") setTheme("light");
    else if (theme === "light") setTheme("system");
    else setTheme("dark");
  };

  const Icon = theme === "system" ? Monitor : resolvedTheme === "dark" ? Moon : Sun;
  const label = theme === "system" ? "Auto (système)" : resolvedTheme === "dark" ? "Mode sombre" : "Mode clair";

  return (
    <button
      onClick={cycle}
      aria-label={`Changer le thème — actuellement ${label}`}
      title={label}
      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105 ${className}`}
      style={{
        background: "var(--bg-2)",
        border: "1px solid var(--border-1)",
        color: "var(--text-0)",
      }}
    >
      <Icon size={18} />
    </button>
  );
}
