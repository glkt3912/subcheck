import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto-sans-jp",
});

export const metadata: Metadata = {
  title: "SubCheck - サブスク無駄率診断",
  description: "あなたのサブスクリプション、本当に使ってる？無駄な支出を可視化して、賢い節約を始めよう。",
  keywords: ["サブスクリプション", "診断", "節約", "無駄", "月額", "見直し"],
  openGraph: {
    title: "SubCheck - サブスク無駄率診断",
    description: "サブスクの無駄を見える化。あなたの使ってない率は何％？",
    locale: "ja_JP",
    type: "website",
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
        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
