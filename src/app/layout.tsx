import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "意識らしさ実験",
  description:
    "観測者が対象に「意識がある」と感じる条件を測定する実験アプリ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <div className="mx-auto max-w-3xl px-4 py-8 md:py-12">{children}</div>
      </body>
    </html>
  );
}
