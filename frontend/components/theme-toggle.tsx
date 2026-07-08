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

function SunIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M12 3a6 6 0 0 0 9 7.2A9 9 0 1 1 12 3Z" />
    </svg>
  );
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

  const nextTheme: Theme = theme === "dark" ? "light" : "dark";
  const label =
    theme === "dark" ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      aria-label={label}
      className="grid size-10 place-items-center rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-muted)] shadow-sm backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:bg-[var(--surface-hover)] hover:text-[var(--text-strong)]"
      onClick={() => updateTheme(nextTheme)}
      suppressHydrationWarning
      title={label}
      type="button"
    >
      <span
        className={`transition duration-200 ${
          isMounted ? "scale-100 opacity-100" : "scale-90 opacity-0"
        }`}
      >
        {theme === "dark" ? <MoonIcon /> : <SunIcon />}
      </span>
    </button>
  );
}
