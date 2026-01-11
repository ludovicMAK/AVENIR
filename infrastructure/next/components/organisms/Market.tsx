"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useShares } from "@/hooks/useShares";
import { useTradingAccount } from "@/hooks/useTradingAccount";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/atoms/Card";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Skeleton } from "@/components/atoms/Skeleton";
import { Badge } from "@/components/atoms/Badge";
import { Search, TrendingUp, TrendingDown, ArrowRight, AlertCircle } from "lucide-react";
import { useTranslations } from "@/lib/i18n/simple-i18n";

export default function Market() {
  const router = useRouter();
  const { shares, isLoading, error } = useShares();
  const { hasTradingAccount, isLoading: accountsLoading } = useTradingAccount();
  const [searchQuery, setSearchQuery] = useState("");
  const t = useTranslations('market');

  const filteredShares = shares.filter((share) =>
    share.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>
        <Skeleton className="h-12 w-full" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>
        <Card className="border-destructive/50">
          <CardContent className="p-6">
            <p className="text-center text-destructive">
              {t('loadError')}
            </p>
            <p className="text-sm text-muted-foreground text-center mt-2">
              {error.message}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Marché</h1>
        <p className="text-muted-foreground">
          Découvrez et investissez dans nos actions
        </p>
      </div>

      {!accountsLoading && !hasTradingAccount && (
        <Card className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                  Compte titre requis
                </h3>
                <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
                  Vous devez créer un compte titre (compte de type &quot;trading&quot;) avant de pouvoir acheter ou vendre des actions.
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push("/dashboard/accounts/new")}
                  className="border-yellow-600 text-yellow-900 hover:bg-yellow-100 dark:text-yellow-100 dark:hover:bg-yellow-900/50"
                >
                  Créer un compte titre
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('availableShares') + "..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {filteredShares.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            {searchQuery
              ? "Aucune action ne correspond à votre recherche"
              : t('noSharesMessage')}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredShares.map((share) => {
            const currentPrice = share.lastExecutedPrice ?? share.initialPrice ?? 0;
            const priceChange =
              share.lastExecutedPrice && share.initialPrice
                ? ((share.lastExecutedPrice - share.initialPrice) /
                    share.initialPrice) *
                  100
                : 0;
            const isPositive = priceChange >= 0;

            return (
              <Card
                key={share.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() =>
                  router.push(`/dashboard/investments/market/${share.id}`)
                }
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{share.name}</CardTitle>
                      <CardDescription>
                        {share.totalNumberOfParts.toLocaleString("fr-FR")} parts
                      </CardDescription>
                    </div>
                    {share.lastExecutedPrice && (
                      <Badge
                        variant={isPositive ? "default" : "destructive"}
                        className="gap-1"
                      >
                        {isPositive ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {priceChange > 0 ? "+" : ""}
                        {priceChange.toFixed(2)}%
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Prix actuel
                      </p>
                      <p className="text-2xl font-bold">
                        {currentPrice.toFixed(2)} €
                      </p>
                    </div>

                    {share.lastExecutedPrice && (
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Prix initial
                        </p>
                        <p className="text-sm">
                          {share.initialPrice.toFixed(2)} €
                        </p>
                      </div>
                    )}

                    <Button className="w-full" variant="outline">
                      {t('viewDetails')}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
