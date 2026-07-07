import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google";
import { ShaderBackground } from "@/components/shader-background";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  getDefaultSiteSettings,
  getSiteSettings,
  getStrapiMediaUrl,
} from "@/lib/strapi";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

function getOverlayOpacityPercent(value: number | string | null | undefined) {
  const transparency = Number(value);

  if (!Number.isFinite(transparency)) {
    return "65%";
  }

  const clampedTransparency = Math.min(1, Math.max(0, transparency));
  return `${Math.round((1 - clampedTransparency) * 100)}%`;
}

function getOverlayColor(
  value: string | null | undefined,
  fallback: string,
) {
  if (value && /^#[\da-f]{3,8}$/i.test(value.trim())) {
    return value.trim();
  }

  return fallback;
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = (await getSiteSettings()) ?? getDefaultSiteSettings();
  const faviconUrl = getStrapiMediaUrl(settings.favicon);

  return {
    title: {
      default: settings.siteName,
      template: `%s | ${settings.siteName}`,
    },
    description: "Website powered by Strapi and Next.js.",
    icons: faviconUrl ? { icon: faviconUrl } : undefined,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = (await getSiteSettings()) ?? getDefaultSiteSettings();
  const legacyBackgroundImageUrl = getStrapiMediaUrl(settings.backgroundImage);
  const lightBackgroundImageUrl =
    getStrapiMediaUrl(settings.backgroundImageLight) ??
    legacyBackgroundImageUrl ??
    getStrapiMediaUrl(settings.backgroundImageDark);
  const darkBackgroundImageUrl =
    getStrapiMediaUrl(settings.backgroundImageDark) ?? lightBackgroundImageUrl;
  const shouldUseImageBackground =
    settings.backgroundMode === "image" && Boolean(lightBackgroundImageUrl);
  const shouldUseShaderBackground = settings.backgroundMode === "shader";
  const bodyClassName = [
    "flex min-h-full flex-col",
    shouldUseImageBackground ? "has-custom-background" : "",
    shouldUseShaderBackground ? "has-shader-background" : "",
  ]
    .filter(Boolean)
    .join(" ");
  const bodyStyle = shouldUseImageBackground
    ? ({
        "--site-background-image-dark": `url(${darkBackgroundImageUrl})`,
        "--site-background-image-light": `url(${lightBackgroundImageUrl})`,
        "--site-background-overlay-color-dark": getOverlayColor(
          settings.backgroundOverlayColorDark,
          "#05060a",
        ),
        "--site-background-overlay-color-light": getOverlayColor(
          settings.backgroundOverlayColorLight,
          "var(--background)",
        ),
        "--site-background-overlay-opacity-dark": getOverlayOpacityPercent(
          settings.backgroundOverlayTransparencyDark,
        ),
        "--site-background-overlay-opacity-light": getOverlayOpacityPercent(
          settings.backgroundOverlayTransparencyLight,
        ),
      } as CSSProperties)
    : undefined;
  const themeScript = `
    try {
      const storedTheme = localStorage.getItem("theme");
      const defaultTheme = ${JSON.stringify(settings.defaultTheme)};
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      const configuredTheme = defaultTheme === "system" ? systemTheme : defaultTheme;
      const theme = storedTheme === "light" || storedTheme === "dark" ? storedTheme : configuredTheme;
      document.documentElement.classList.toggle("dark", theme === "dark");
      document.documentElement.style.colorScheme = theme;
    } catch (_) {}
  `;

  return (
    <html
      lang="de"
      className={`${geistSans.variable} ${geistMono.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className={bodyClassName} style={bodyStyle}>
        {shouldUseShaderBackground ? <ShaderBackground /> : null}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
