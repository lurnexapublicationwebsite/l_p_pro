import { Metadata } from "next";
import { Cinzel, Playfair_Display, Great_Vibes, Plus_Jakarta_Sans } from "next/font/google";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  variable: "--font-cinzel"
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-playfair"
});

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-great-vibes"
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta"
});

export const metadata: Metadata = {
  title: "🎂 Happy Birthday Hasini! • Royal Dual Book Launch Ceremony (30 Oct)",
  description:
    "A special interactive birthday celebration & grand dual textbook launch ceremony in honor of Hasini on October 30.",
  openGraph: {
    title: "🎂 Happy Birthday Hasini! • Official Dual Book Launch",
    description:
      "Tap to open your October 30 Birthday Surprise, blow out the candles, cut the cake, and launch 2 new books!",
    type: "website"
  }
};

export default function HasiniBirthdayLaunchLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${cinzel.variable} ${playfair.variable} ${greatVibes.variable} ${jakarta.variable}`}
      style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
    >
      {children}
    </div>
  );
}
