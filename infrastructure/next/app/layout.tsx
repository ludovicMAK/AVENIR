import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AVENIR - Votre banque en ligne",
  description: "AVENIR - Banque en ligne moderne offrant des services de gestion de comptes, investissements et crédits",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased bg-background text-white`}
      >
        {children}
      </body>
    </html>
  );
}
