import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BackgroundMusic } from "@/src/components/BackgroundMusic";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "Ganesh Sahu - Full Stack Developer Portfolio",
  description: "Interactive portfolio showcasing full-stack development skills through both professional and gamified experiences",
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
