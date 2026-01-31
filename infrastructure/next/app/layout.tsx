import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n/simple-i18n";
import { Toaster } from "@/components/atoms/Sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001"
  ),
  title: {
    default: "AVENIR - Votre banque en ligne",
    template: "%s | AVENIR",
  },
  description:
    "AVENIR - Banque en ligne moderne offrant des services de gestion de comptes, investissements et crédits",
  keywords: [
    "banque en ligne",
    "compte bancaire",
    "investissement",
    "crédit",
    "épargne",
    "AVENIR",
    "banque digitale",
  ],
  authors: [{ name: "AVENIR" }],
  creator: "AVENIR",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "/",
    siteName: "AVENIR",
    title: "AVENIR - Votre banque en ligne",
    description:
      "Banque en ligne moderne avec gestion de comptes, investissements et crédits",
  },
  twitter: {
    card: "summary_large_image",
    title: "AVENIR - Votre banque en ligne",
    description:
      "Banque en ligne moderne avec gestion de comptes, investissements et crédits",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${inter.variable} antialiased bg-background text-white`}
      >
        <I18nProvider>
          {children}
          <Toaster />
        </I18nProvider>
      </body>
    </html>
  );
}
