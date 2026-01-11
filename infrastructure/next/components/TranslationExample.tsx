"use client";

import { useTranslations } from '@/lib/i18n/simple-i18n';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TranslationExample() {
  const t = useTranslations('common');
  
  const tAuth = useTranslations('auth');
  
  const tNav = useTranslations('navigation');

  return (
    <Card>
      <CardHeader>
        <CardTitle>🌍 Exemple de traductions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">Common:</h3>
          <ul className="space-y-1 text-sm">
            <li>• {t('appName')} - {t('tagline')}</li>
            <li>• {t('welcome')}</li>
            <li>• {t('loading')} / {t('error')} / {t('success')}</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Auth:</h3>
          <ul className="space-y-1 text-sm">
            <li>• {tAuth('login')} / {tAuth('logout')}</li>
            <li>• {tAuth('register')}</li>
            <li>• {tAuth('email')} / {tAuth('password')}</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Navigation:</h3>
          <ul className="space-y-1 text-sm">
            <li>• {tNav('dashboard')}</li>
            <li>• {tNav('accounts')} / {tNav('transfers')}</li>
            <li>• {tNav('market')} / {tNav('portfolio')}</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
