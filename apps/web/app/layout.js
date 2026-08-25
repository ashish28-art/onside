import { Bebas_Neue, Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Three faces, three jobs -- not styling flourish:
//   display -- condensed, stadium-signage feel, headlines + wordmark only
//   body    -- clean geometric sans, everything you actually read
//   mono    -- tabular numerals, scores/timers/stats only, so digits
//              align like a real scoreboard instead of a prose sentence
const display = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});
const body = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata = {
  title: "Onside",
  description: "A platform for football fans -- matches, community, watch parties.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
