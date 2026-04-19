import type { Metadata } from "next";
import { Press_Start_2P, Inter } from "next/font/google";
import "./globals.css";

const pixel = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "AI Slop Radar 🪲",
  description:
    "Fight GIGO. Trace AI news back to the source. Stop wasting time on repackaged slop.",
  openGraph: {
    title: "AI Slop Radar 🪲",
    description: "Fight GIGO. Trace AI news to the source.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${pixel.variable} ${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)] antialiased">
        {children}
      </body>
    </html>
  );
}
