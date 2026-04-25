import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "@/components/landing/coded-research-asset.css";
import "@/components/landing/coded-research-panels.css";
import "@/components/landing/lab-console.css";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist"
});

export const metadata: Metadata = {
  title: "FrictionLab",
  description: "AI conversion research. Synthetic user swarms. Real friction. Real impact.",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" }
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }]
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={geist.variable}>
      <body>
        <div className="lab-shell">{children}</div>
      </body>
    </html>
  );
}
