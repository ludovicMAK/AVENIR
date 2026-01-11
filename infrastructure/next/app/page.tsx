"use client";

import Link from "next/link";
import { useCurrentUser } from "@/hooks/useCurrentUser";
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
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslations } from "@/lib/i18n/simple-i18n";

export default function LandingPage() {
  const { user } = useCurrentUser();
  const t = useTranslations('landing.hero');
  const tFeatures = useTranslations('landing.features');
  const tAccountTypes = useTranslations('landing.accountTypes');
  const tBenefits = useTranslations('landing.benefits');
  const tCta = useTranslations('landing.cta');
  const tAuth = useTranslations('auth');
  const tNav = useTranslations('navigation');

  const features = [
    {
      icon: Wallet,
      title: tFeatures('multiAccount.title'),
      description: tFeatures('multiAccount.description'),
    },
    {
      icon: Shield,
      title: tFeatures('security.title'),
      description: tFeatures('security.description'),
    },
    {
      icon: TrendingUp,
      title: tFeatures('realTime.title'),
      description: tFeatures('realTime.description'),
    },
    {
      icon: BarChart3,
      title: tFeatures('analytics.title'),
      description: tFeatures('analytics.description'),
    },
  ];

  const benefits = [
    tBenefits('benefit1'),
    tBenefits('benefit2'),
    tBenefits('benefit3'),
    tBenefits('benefit4'),
    tBenefits('benefit5'),
    tBenefits('benefit6'),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">AVENIR</span>
          </div>
          <nav className="flex items-center gap-4">
            <LanguageSwitcher />
            {user ? (
              <Button asChild>
                <Link href="/dashboard">
                  {tNav('dashboard')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">{tAuth('login')}</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">
                    {tAuth('register')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            {t('title')}
            <span className="block text-primary mt-2">{t('subtitle')}</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            {t('description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" asChild>
              <Link href="/register">
                {t('openAccount')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">{t('login')}</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          {tFeatures('title')}
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

      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          {tAccountTypes('title')}
        </h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="border-2">
            <CardContent className="pt-6">
              <CreditCard className="h-10 w-10 text-blue-600 mb-4" />
              <h3 className="font-semibold text-xl mb-2">{tAccountTypes('current.title')}</h3>
              <p className="text-muted-foreground mb-4">
                {tAccountTypes('current.description')}
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  {tAccountTypes('current.feature1')}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  {tAccountTypes('current.feature2')}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  {tAccountTypes('current.feature3')}
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="pt-6">
              <PiggyBank className="h-10 w-10 text-green-600 mb-4" />
              <h3 className="font-semibold text-xl mb-2">{tAccountTypes('savings.title')}</h3>
              <p className="text-muted-foreground mb-4">
                {tAccountTypes('savings.description')}
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  {tAccountTypes('savings.feature1')}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  {tAccountTypes('savings.feature2')}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  {tAccountTypes('savings.feature3')}
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="pt-6">
              <TrendingUp className="h-10 w-10 text-purple-600 mb-4" />
              <h3 className="font-semibold text-xl mb-2">{tAccountTypes('trading.title')}</h3>
              <p className="text-muted-foreground mb-4">
                {tAccountTypes('trading.description')}
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  {tAccountTypes('trading.feature1')}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  {tAccountTypes('trading.feature2')}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  {tAccountTypes('trading.feature3')}
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            {tBenefits('title')}
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

      <section className="container mx-auto px-4 py-20">
        <Card className="max-w-3xl mx-auto border-2 border-primary">
          <CardContent className="pt-12 pb-12 text-center">
            <h2 className="text-3xl font-bold mb-4">{tCta('title')}</h2>
            <p className="text-muted-foreground text-lg mb-8">
              {tCta('description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/register">
                  {tCta('createAccount')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">{tAuth('hasAccount')}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <footer className="border-t bg-muted/50 mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>© 2026 AVENIR - Votre banque en ligne nouvelle génération</p>
        </div>
      </footer>
    </div>
  );
}
