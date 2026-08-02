import type { Metadata, Viewport } from "next";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n";
import { ServiceWorker } from "@/components/ServiceWorker";

export const metadata: Metadata = {
  title: "Croppen — an amazing tour of human anatomy",
  description:
    "Peel the human body apart layer by layer: skin, muscle, organs and bone, plus the circulatory, nervous, lymphatic and endocrine systems. In Danish and English.",
  applicationName: "Croppen",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Croppen",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#05080b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <I18nProvider>{children}</I18nProvider>
        <ServiceWorker />
      </body>
    </html>
  );
}
