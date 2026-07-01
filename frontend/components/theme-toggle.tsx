"use client";

import { useEffect, useState } from "react";
import type { ThemePreference } from "@/lib/strapi";

type Theme = "light" | "dark";

function getPreferredTheme(defaultTheme: ThemePreference): Theme {
  if (typeof window === "undefined") {
    return "light";
  }

  const storedTheme = window.localStorage.getItem("theme");

  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  if (defaultTheme === "light" || defaultTheme === "dark") {
    return defaultTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
}

export function ThemeToggle({
  defaultTheme = "system",
}: {
  defaultTheme?: ThemePreference;
}) {
  const [theme, setTheme] = useState<Theme>("light");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const preferredTheme = getPreferredTheme(defaultTheme);
      setTheme(preferredTheme);
      applyTheme(preferredTheme);
      setIsMounted(true);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [defaultTheme]);

  function updateTheme(nextTheme: Theme) {
    setTheme(nextTheme);
    applyTheme(nextTheme);
    window.localStorage.setItem("theme", nextTheme);
  }

  return (
    <div
      aria-label="Farbschema"
      className="grid h-9 grid-cols-2 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-0.5 text-xs font-medium text-[var(--text-muted)] shadow-sm backdrop-blur"
      role="group"
      suppressHydrationWarning
    >
      {(["light", "dark"] as const).map((option) => {
        const isActive = isMounted && theme === option;

        return (
          <button
            aria-pressed={isActive}
            className={`rounded-lg px-3 transition ${
              isActive
                ? "bg-[var(--surface)] text-[var(--text-strong)] shadow-sm"
                : "hover:text-[var(--text-strong)]"
            }`}
            key={option}
            onClick={() => updateTheme(option)}
            type="button"
          >
            {option === "light" ? "Hell" : "Dunkel"}
          </button>
        );
      })}
    </div>
  );
}
