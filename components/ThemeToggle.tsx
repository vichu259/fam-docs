"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="w-8 h-8" />;

  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="text-stone-400 dark:text-zinc-500 hover:text-stone-600 dark:hover:text-zinc-300 p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-zinc-800 transition"
      title="Toggle theme"
    >
      {resolvedTheme === "dark"
        ? <Sun className="w-4 h-4" />
        : <Moon className="w-4 h-4" />
      }
    </button>
  );
}
