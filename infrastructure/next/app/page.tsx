import type { Metadata } from "next";
import { LandingHeader } from "@/components/molecules/LandingHeader";
import { LandingContent } from "@/components/molecules/LandingContent";

export const metadata: Metadata = {
  title: "AVENIR - Votre banque en ligne nouvelle génération",
  description:
    "AVENIR - Banque en ligne moderne offrant des services de gestion de comptes, investissements, crédits et épargne. Ouvrez votre compte gratuitement.",
  keywords: [
    "banque en ligne",
    "compte bancaire",
    "investissement",
    "crédit",
    "épargne",
    "AVENIR",
  ],
  openGraph: {
    title: "AVENIR - Votre banque en ligne nouvelle génération",
    description:
      "Banque en ligne moderne avec gestion de comptes, investissements et crédits",
    type: "website",
    locale: "fr_FR",
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <LandingHeader />
      <LandingContent />
    </div>
  );
}
