import type { Metadata, Viewport } from "next";

import "./globals.css";
import { BackgroundMusic } from "@/src/components/BackgroundMusic";

export const viewport: Viewport = {
  themeColor: "#06b6d4",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Ganesh Sahu | Full Stack Developer & Game Developer",
  description: "Interactive portfolio of Ganesh Sahu, a Full Stack Developer specializing in React, Next.js, and Phaser. Explore professional projects and a gamified experience.",
  keywords: ["Ganesh Sahu", "Full Stack Developer", "Software Engineer", "React Developer", "Next.js", "Portfolio", "Game Development", "Java Developer"],
  authors: [{ name: "Ganesh Sahu" }],
  manifest: "/manifest.json",
  openGraph: {
    title: "Ganesh Sahu - Full Stack Developer",
    description: "Interactive portfolio showcasing full-stack development skills through both professional and gamified experiences",
    url: "https://ganeshsahu.com", // Replace with your actual domain
    siteName: "Ganesh Sahu Portfolio",
    images: [
      {
        url: "/assets/the_sage.jpg",
        width: 1200,
        height: 630,
        alt: "Ganesh Sahu Portfolio",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ganesh Sahu - Full Stack Developer",
    description: "Interactive portfolio showcasing full-stack development skills through both professional and gamified experiences",
    images: ["/assets/the_sage.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="antialiased"
        suppressHydrationWarning
      >
        <BackgroundMusic />
        {children}
      </body>
    </html>
  );
}
