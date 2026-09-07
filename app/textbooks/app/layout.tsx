import type { Metadata } from "next";

// Route-specific metadata for the installable reading app. This overrides the root layout's
// site-wide manifest link for pages under /textbooks/app, so installing from here points at
// textbook-app-manifest.json (start_url: /textbooks/app/, scoped to just this route) instead
// of the whole marketing site's manifest.
export const metadata: Metadata = {
  title: "Lurnexa Textbooks — Sign In & Read",
  description: "Sign in or sign up to read your purchased and rented Lurnexa textbooks and caselets.",
  manifest: "/textbook-app-manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Lurnexa Textbooks",
  },
  icons: {
    icon: [
      { url: "/icons/reader-app-icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/reader-app-icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/reader-app-icon-192.png", sizes: "192x192", type: "image/png" }],
  },
};

export default function TextbookAppLayout({ children }: { children: React.ReactNode }) {
  return children;
}
