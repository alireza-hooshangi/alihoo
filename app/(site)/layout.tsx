import { getSiteContent } from "@/sanity/lib/content";
import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Alihoo — Independent projects & experiments",
  description: "Independent projects, experiments, and product concepts by Alihoo. Creative Director at Hooman Studio, working across brand, interface, and systems.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const content = await getSiteContent();
  return <html lang="en" className={neueMontreal.variable}><body><Portfolio content={content}>{children}</Portfolio></body></html>;
}
