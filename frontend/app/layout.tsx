import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RWA DEX - DeFi Exchange",
  description: "Decentralized Exchange with AMM, Lending, and Yield Farming",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}

