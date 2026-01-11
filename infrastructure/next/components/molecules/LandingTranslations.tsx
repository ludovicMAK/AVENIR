"use client";

import { useTranslations } from "@/lib/i18n/simple-i18n";

export function LandingTranslations() {
  const t = useTranslations("landing.hero");
  const tFeatures = useTranslations("landing.features");
  const tAccountTypes = useTranslations("landing.accountTypes");
  const tBenefits = useTranslations("landing.benefits");
  const tCta = useTranslations("landing.cta");

  return {
    hero: {
      title: t("title"),
      subtitle: t("subtitle"),
      description: t("description"),
      openAccount: t("openAccount"),
      login: t("login"),
    },
    features: {
      title: tFeatures("title"),
      multiAccount: {
        title: tFeatures("multiAccount.title"),
        description: tFeatures("multiAccount.description"),
      },
      security: {
        title: tFeatures("security.title"),
        description: tFeatures("security.description"),
      },
      realTime: {
        title: tFeatures("realTime.title"),
        description: tFeatures("realTime.description"),
      },
      analytics: {
        title: tFeatures("analytics.title"),
        description: tFeatures("analytics.description"),
      },
    },
    accountTypes: {
      title: tAccountTypes("title"),
      current: {
        title: tAccountTypes("current.title"),
        description: tAccountTypes("current.description"),
        feature1: tAccountTypes("current.feature1"),
        feature2: tAccountTypes("current.feature2"),
        feature3: tAccountTypes("current.feature3"),
      },
      savings: {
        title: tAccountTypes("savings.title"),
        description: tAccountTypes("savings.description"),
        feature1: tAccountTypes("savings.feature1"),
        feature2: tAccountTypes("savings.feature2"),
        feature3: tAccountTypes("savings.feature3"),
      },
      trading: {
        title: tAccountTypes("trading.title"),
        description: tAccountTypes("trading.description"),
        feature1: tAccountTypes("trading.feature1"),
        feature2: tAccountTypes("trading.feature2"),
        feature3: tAccountTypes("trading.feature3"),
      },
    },
    benefits: {
      title: tBenefits("title"),
      items: [
        tBenefits("benefit1"),
        tBenefits("benefit2"),
        tBenefits("benefit3"),
        tBenefits("benefit4"),
        tBenefits("benefit5"),
        tBenefits("benefit6"),
      ],
    },
    cta: {
      title: tCta("title"),
      description: tCta("description"),
      createAccount: tCta("createAccount"),
    },
  };
}
