import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const nunito = localFont({
  src: "./fonts/nunito-sans-latin.woff2",
  weight: "200 1000",
  display: "swap",
  variable: "--font-nunito",
});

const fraunces = localFont({
  src: "./fonts/fraunces-latin.woff2",
  weight: "100 900",
  display: "swap",
  variable: "--font-fraunces",
});

export const metadata: Metadata = {
  title: "Neighbourhood Soil Loop",
  description:
    "Trace food scraps from the block bin to compost to the community garden.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Soil Loop",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2f5d38",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${nunito.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
