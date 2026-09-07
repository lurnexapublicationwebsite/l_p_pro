import type { Metadata } from "next";

// Applies to /textbooks/portal/login and /signup (and the bare /textbooks/portal redirect).
// Linking the reading-app manifest here — not just on /textbooks/app — means the browser's
// install prompt fires while browsing this page too, so the "Get the Lurnexa Textbooks App"
// button can trigger a direct install instead of only being able to link to /textbooks/app.
export const metadata: Metadata = {
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

export default function TextbookPortalLayout({ children }: { children: React.ReactNode }) {
  return children;
}
