"use client";

import { createContext, useContext, ReactNode, useState, useEffect, useMemo } from 'react';

// Import des traductions
import fr from '@/i18n/messages/fr.json';
import en from '@/i18n/messages/en.json';

type Locale = 'fr' | 'en';
type Messages = typeof fr;

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

const messages: Record<Locale, Messages> = {
  fr,
  en,
};

export function I18nProvider({ children }: { children: ReactNode }) {
  // Toujours commencer avec 'fr' pour SSR et premier rendu client (évite hydration mismatch)
  const [locale, setLocaleState] = useState<Locale>('fr');

  // Lire le cookie et mettre à jour après le montage côté client
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const match = document.cookie.match(/locale=([^;]+)/);
      if (match && (match[1] === 'fr' || match[1] === 'en')) {
        const cookieLocale = match[1] as Locale;
        if (cookieLocale !== locale) {
          setLocaleState(cookieLocale);
        }
      }
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    // Écrire le cookie
    document.cookie = `locale=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    setLocaleState(newLocale);
  };

  // Fonction pour récupérer une traduction par clé imbriquée
  const t = useMemo(() => {
    return (key: string): string => {
      const keys = key.split('.');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let value: any = messages[locale];
      
      for (const k of keys) {
        value = value?.[k];
        if (value === undefined) {
          return key; // Retourner la clé si la traduction est manquante
        }
      }
      
      return typeof value === 'string' ? value : key;
    };
  }, [locale]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

// Hook pour utiliser les traductions d'un namespace spécifique
export function useTranslations(namespace: string) {
  const { t, locale } = useI18n();
  
  // Recrée la fonction quand la locale change
  return useMemo(() => {
    return (key: string) => {
      const fullKey = `${namespace}.${key}`;
      return t(fullKey);
    };
  }, [namespace, t, locale]);
}
