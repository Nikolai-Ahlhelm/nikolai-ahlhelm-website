import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
