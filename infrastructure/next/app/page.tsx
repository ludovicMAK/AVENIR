import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/users/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Wallet,
  TrendingUp,
  Shield,
  CreditCard,
  PiggyBank,
  BarChart3,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export default async function LandingPage() {
  const user = await getCurrentUser();

  // Si l'utilisateur est déjà connecté, rediriger vers le dashboard
  if (user) {
    redirect("/dashboard");
  }

  const features = [
    {
      icon: Wallet,
      title: "Gestion multi-comptes",
      description:
        "Gérez vos comptes courants, épargne et titres en un seul endroit",
    },
    {
      icon: Shield,
      title: "Sécurité maximale",
      description:
        "Vos données sont protégées avec les dernières technologies de sécurité",
    },
    {
      icon: TrendingUp,
      title: "Suivi en temps réel",
      description: "Consultez vos soldes et transactions instantanément",
    },
    {
      icon: BarChart3,
      title: "Analyses détaillées",
      description:
        "Visualisez vos dépenses et revenus avec des graphiques clairs",
    },
  ];

  const benefits = [
    "Ouverture de compte en 5 minutes",
    "Aucun frais cachés",
    "Support client 7j/7",
    "Application mobile disponible",
    "Virements instantanés",
    "Découvert autorisé disponible",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">AVENIR</span>
          </div>
          <nav className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Connexion</Link>
            </Button>
            <Button asChild>
              <Link href="/register">
                Inscription
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Votre banque en ligne
            <span className="block text-primary mt-2">nouvelle génération</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            AVENIR simplifie la gestion de vos finances avec une interface
            moderne et intuitive. Ouvrez votre compte en quelques minutes et
            profitez d'une expérience bancaire réinventée.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" asChild>
              <Link href="/register">
                Ouvrir un compte
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Se connecter</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          Tout ce dont vous avez besoin
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                className="border-2 hover:border-primary transition-colors"
              >
                <CardContent className="pt-6">
                  <Icon className="h-12 w-12 text-primary mb-4" />
                  <h3 className="font-semibold text-lg mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Account Types */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          Des comptes adaptés à vos besoins
        </h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="border-2">
            <CardContent className="pt-6">
              <CreditCard className="h-10 w-10 text-blue-600 mb-4" />
              <h3 className="font-semibold text-xl mb-2">Compte Courant</h3>
              <p className="text-muted-foreground mb-4">
                Pour vos dépenses quotidiennes avec découvert autorisé
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Carte bancaire gratuite
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Virements illimités
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Découvert personnalisable
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="pt-6">
              <PiggyBank className="h-10 w-10 text-green-600 mb-4" />
              <h3 className="font-semibold text-xl mb-2">Compte Épargne</h3>
              <p className="text-muted-foreground mb-4">
                Faites fructifier votre argent en toute sécurité
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Taux d'intérêt compétitif
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Retraits flexibles
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Capital garanti
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="pt-6">
              <TrendingUp className="h-10 w-10 text-purple-600 mb-4" />
              <h3 className="font-semibold text-xl mb-2">Compte Titres</h3>
              <p className="text-muted-foreground mb-4">
                Investissez en bourse simplement
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Accès aux marchés
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Frais réduits
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Analyses en temps réel
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Benefits List */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Pourquoi choisir AVENIR ?
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {benefits.map((benefit) => (
              <div
                key={benefit}
                className="flex items-center gap-3 p-4 rounded-lg bg-muted/50"
              >
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
                <span className="font-medium">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="max-w-3xl mx-auto border-2 border-primary">
          <CardContent className="pt-12 pb-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Prêt à commencer ?</h2>
            <p className="text-muted-foreground text-lg mb-8">
              Rejoignez des milliers d'utilisateurs qui font confiance à AVENIR
              pour gérer leurs finances au quotidien.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/register">
                  Créer mon compte gratuitement
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">J'ai déjà un compte</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/50 mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>© 2026 AVENIR - Votre banque en ligne nouvelle génération</p>
        </div>
      </footer>
    </div>
  );
}
