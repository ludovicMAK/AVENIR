"use client";

import { createContext, useContext, ReactNode, useState, useEffect, useMemo } from 'react';

import fr from '@/i18n/messages/fr.json';
import en from '@/i18n/messages/en.json';

type Locale = 'fr' | 'en';
type Messages = {
  [key: string]: string | Messages;
};

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
  const [locale, setLocaleState] = useState<Locale>('fr');

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
    document.cookie = `locale=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    setLocaleState(newLocale);
  };

  function getMessage(obj: Messages | string, keys: string[]): string | undefined {
    if (keys.length === 0) {
      return typeof obj === 'string' ? obj : undefined;
    }
    const [first, ...rest] = keys;
    if (typeof obj === 'object' && obj !== null && Object.prototype.hasOwnProperty.call(obj, first)) {
      return getMessage(obj[first], rest);
    }
    return undefined;
  }

  const t = useMemo(() => {
    return (key: string): string => {
      const keys = key.split('.');
      const result = getMessage(messages[locale], keys);
      return result !== undefined ? result : key;
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

export function useTranslations(namespace: string) {
  const { t, locale } = useI18n();
  
  return useMemo(() => {
    return (key: string) => {
      const fullKey = `${namespace}.${key}`;
      return t(fullKey);
    };
  }, [namespace, t, locale]);
}
