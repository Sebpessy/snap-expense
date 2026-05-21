import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Xpenz — AI expense tracking for any business",
  description:
    "Snap a receipt. Done. Track every business expense by project, client, and tax category — in 3 seconds, from your phone. Free for 30 days.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Xpenz",
  },
  openGraph: {
    title: "Xpenz — AI expense tracking for any business",
    description:
      "Snap a receipt. Done. Track every business expense by project, client, and tax category. Free for 30 days.",
    type: "website",
    siteName: "Xpenz",
  },
  twitter: {
    card: "summary_large_image",
    title: "Xpenz — AI expense tracking for any business",
    description:
      "Snap a receipt. Done. AI tags vendor, total, date, and tax category in seconds. Built for businesses of every size. Free for 30 days.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body className="antialiased">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
