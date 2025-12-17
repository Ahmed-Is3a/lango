import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SwRegister from "./sw-register";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lango - Language Learning App",
  description: "Master languages one word at a time with interactive flashcards and quizzes",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#2563eb",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Register service worker on client */}
        {/* This runs on every page and is a no-op on server */}
        {typeof window !== "undefined" && <></>}
        {/* Client component mounts and registers /sw.js */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        {/* Mount client SW register component */}
        {/* Importing here ensures it's included globally */}
        {
          // eslint-disable-next-line react/jsx-no-useless-fragment
          <>
            {/** Dynamically import client component to avoid SSR issues */}
          </>
        }
        {/* Directly include the client component */}
        {/* Note: server components can render client components safely */}
        <SwRegister />

        {children}
      </body>
    </html>
  );
}