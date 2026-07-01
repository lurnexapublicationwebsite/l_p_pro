import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { AuthProvider } from "./providers/AuthProvider";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://lurnexa.in"),
  title: {
    default: "LURNEXA PUBLICATIONS | Excellence in Scholarly Publishing & Academic Research",
    template: "%s | LURNEXA PUBLICATIONS",
  },
  description:
    "LURNEXA PUBLICATIONS is a premier techno-management powerhouse and scholarly publisher. We bridge the gap between high-impact academic publishing, peer-reviewed journals, and global research dissemination to drive science and innovation.",
  keywords: [
    "LURNEXA PUBLICATIONS",
    "Lurnexa Publications",
    "Narendra Kumar Kurakula",
    "Rushik Burla",
    "Scholarly Publishing",
    "Academic Journals",
    "Research Paper Publication",
    "Open Access Research",
    "Peer-Reviewed Journals",
    "Techno-Management Hub",
    "Academic Excellence",
    "Digital Publishing India",
    "Global Journal for Progressive Innovation and Research",
    "GJPIR Journal",
    "Advanced Computational Intelligence & Emerging Technologies",
    "ACIET Journal",
    "Center for Innovative Management Studies",
    "CIMS Journal",
    "Advanced Research in Economics & Social Sciences",
    "ARESS Journal",
    "Institute of Advanced Electrical & Electronics Studies",
    "IAEES Journal",
    "Submit Research Paper Online",
    "Call for Papers Academic Journal",
    "UGC Care Listed Journals",
    "Scopus Scope Journals Indexing",
    "Google Scholar Indexed Publications",
    "Scientific Journal Articles",
    "Peer Reviewed Engineering Journal",
    "Management Studies Journal",
    "Economics Research Paper Submission",
    "Double Blind Peer Review Publications",
    "Fast Track Research Publication"
  ],
  authors: [{ name: "LURNEXA PUBLICATIONS" }],
  creator: "LURNEXA PUBLICATIONS",
  publisher: "LURNEXA PUBLICATIONS",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "LURNEXA PUBLICATIONS | Bridging Knowledge and Research",
    description:
      "A multidisciplinary hub driving excellence through scholarly publishing and academic research dissemination.",
    url: "https://lurnexa.in",
    siteName: "LURNEXA PUBLICATIONS",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Lurnexa Publications - Knowledge & Innovation",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LURNEXA PUBLICATIONS | Excellence in Research & Publications",
    description:
      "Driving the future of academic publishing and global research accessibility.",
    images: ["/og-image.png"],
  },
  verification: {
    google: "ADD_YOUR_GOOGLE_VERIFICATION_CODE_HERE",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png", sizes: "512x512" },
      { url: "/7.svg", type: "image/svg+xml" }
    ],
    shortcut: "/favicon.ico",
    apple: "/favicon.png",
  },
};

import JsonLd from "@/components/SEO/JsonLd";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <JsonLd />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* ✅ Global Auth Context Wrapper */}

        <AuthProvider>
        {children}
     </AuthProvider>
      </body>
    </html>
  );
}
