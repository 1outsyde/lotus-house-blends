import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";
import SessionWrapper from "@/components/SessionWrapper";
import { LHB_CONFIG } from "@/lib/lhb-config";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});
const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-jost",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(LHB_CONFIG.siteUrl),
  title: LHB_CONFIG.siteName,
  description:
    "Handcrafted herbal aromatherapy blends crafted for every ritual of your day — morning, midday, and night.",
  openGraph: {
    url: LHB_CONFIG.siteUrl,
    siteName: LHB_CONFIG.siteName,
    images: [{ url: "/lotus-og.png" }],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cormorant.variable} ${jost.variable}`}>
      <body>
        <SessionWrapper>{children}</SessionWrapper>
      </body>
    </html>
  );
}
