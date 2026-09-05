import type { Metadata } from "next";
import localFont from "next/font/local";
import { Inter, Inter_Tight } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

// Substitusi resmi DESIGN.md untuk messinaSans / messinaSansCondensed
// (keduanya font berlisensi komersial). Dipakai pada homepage saja.
const display = Inter({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["600", "700", "900"],
  display: "swap",
});
const condensed = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-condensed",
  weight: ["600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ISTANA DIENG CLUB HOUSE — Padel, Tenis & Kolam Renang",
  description:
    "Klub olahraga terpadu di Dieng: lapangan padel dan tenis berstandar kompetisi, kolam renang terawat, serta keanggotaan dan reservasi dalam satu sistem.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${display.variable} ${condensed.variable} antialiased bg-white text-ink-900`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
