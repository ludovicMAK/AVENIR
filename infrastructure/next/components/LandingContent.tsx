"use client";

import { LandingTranslations } from "./LandingTranslations";
import Link from "next/link";
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
import { useTranslations } from "@/lib/i18n/simple-i18n";

export function LandingContent() {
  const translations = LandingTranslations();
  const tAuth = useTranslations("auth");

  const features = [
    {
      icon: Wallet,
      title: translations.features.multiAccount.title,
      description: translations.features.multiAccount.description,
    },
    {
      icon: Shield,
      title: translations.features.security.title,
      description: translations.features.security.description,
    },
    {
      icon: TrendingUp,
      title: translations.features.realTime.title,
      description: translations.features.realTime.description,
    },
    {
      icon: BarChart3,
      title: translations.features.analytics.title,
      description: translations.features.analytics.description,
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            {translations.hero.title}
            <span className="block text-primary mt-2">
              {translations.hero.subtitle}
            </span>
          </h1>
          <p className="text-xl text-muted-foreground">
            {translations.hero.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" asChild>
              <Link href="/register">
                {translations.hero.openAccount}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">{translations.hero.login}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          {translations.features.title}
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

      {/* Account Types Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          {translations.accountTypes.title}
        </h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="border-2">
            <CardContent className="pt-6">
              <CreditCard className="h-10 w-10 text-blue-600 mb-4" />
              <h3 className="font-semibold text-xl mb-2">
                {translations.accountTypes.current.title}
              </h3>
              <p className="text-muted-foreground mb-4">
                {translations.accountTypes.current.description}
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  {translations.accountTypes.current.feature1}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  {translations.accountTypes.current.feature2}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  {translations.accountTypes.current.feature3}
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="pt-6">
              <PiggyBank className="h-10 w-10 text-green-600 mb-4" />
              <h3 className="font-semibold text-xl mb-2">
                {translations.accountTypes.savings.title}
              </h3>
              <p className="text-muted-foreground mb-4">
                {translations.accountTypes.savings.description}
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  {translations.accountTypes.savings.feature1}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  {translations.accountTypes.savings.feature2}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  {translations.accountTypes.savings.feature3}
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="pt-6">
              <TrendingUp className="h-10 w-10 text-purple-600 mb-4" />
              <h3 className="font-semibold text-xl mb-2">
                {translations.accountTypes.trading.title}
              </h3>
              <p className="text-muted-foreground mb-4">
                {translations.accountTypes.trading.description}
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  {translations.accountTypes.trading.feature1}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  {translations.accountTypes.trading.feature2}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  {translations.accountTypes.trading.feature3}
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            {translations.benefits.title}
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {translations.benefits.items.map((benefit) => (
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
            <h2 className="text-3xl font-bold mb-4">
              {translations.cta.title}
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              {translations.cta.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/register">
                  {translations.cta.createAccount}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">{tAuth("hasAccount")}</Link>
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
    </>
  );
}
