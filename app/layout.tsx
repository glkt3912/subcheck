import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import ServiceWorkerRegistration from "@/components/pwa/ServiceWorkerRegistration";
import OfflineIndicator from "@/components/ui/OfflineIndicator";
import LicenseNoticeClient from "@/components/legal/LicenseNoticeClient";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto-sans-jp",
  display: 'swap',
  preload: true,
  fallback: ['system-ui', '-apple-system', 'sans-serif'],
});

export const metadata: Metadata = {
  title: "SubCheck - サブスク無駄率診断",
  description: "あなたのサブスクリプション、本当に使ってる？無駄な支出を可視化して、賢い節約を始めよう。",
  keywords: ["サブスクリプション", "診断", "節約", "無駄", "月額", "見直し"],
  manifest: "/manifest.json",
  themeColor: "#2563eb",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SubCheck",
  },
  openGraph: {
    title: "SubCheck - サブスク無駄率診断",
    description: "サブスクの無駄を見える化。あなたの使ってない率は何％？",
    locale: "ja_JP",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'verification-token-here',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${notoSansJP.variable} font-sans antialiased bg-gray-50 text-gray-900`}>
        <a href="#main-content" className="skip-link">
          メインコンテンツにスキップ
        </a>
        <ServiceWorkerRegistration />
        <OfflineIndicator />
        <LicenseNoticeClient />
        <ErrorBoundary>
          <div className="min-h-screen">
            {children}
          </div>
        </ErrorBoundary>
      </body>
    </html>
  );
}
