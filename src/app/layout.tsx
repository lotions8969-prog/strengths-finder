import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ストレングスファインダー診断 | あなたの強みを発見する",
  description: "34の強みテーマから、あなたのTop 5を見つけよう。ギャロップのCliftonStrengthsにインスパイアされた強み診断アプリ。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
