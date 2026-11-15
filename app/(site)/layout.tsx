import { getSiteContent, getSeoSettings } from "@/sanity/lib/content";
import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "../globals.css";
import Portfolio from "../portfolio";

const neueMontreal = localFont({
  src: "../fonts/PPNeueMontreal-Medium.woff2",
  weight: "500",
  style: "normal",
  variable: "--font-neue-montreal",
  display: "swap",
});

export const viewport: Viewport = { themeColor: "#a1a1a1" };

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSeoSettings();
  return { metadataBase: new URL(settings.siteUrl), applicationName: settings.siteName,
    icons: { icon: { url: settings.favicon, type: settings.faviconType, ...(settings.faviconType === "image/svg+xml" ? { sizes: "any" } : {}) }, apple: settings.appleIcon },
    verification: { google: settings.googleVerification } };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const content = await getSiteContent();
  return <html lang="en" className={neueMontreal.variable}><body><Portfolio content={content}>{children}</Portfolio></body></html>;
}
