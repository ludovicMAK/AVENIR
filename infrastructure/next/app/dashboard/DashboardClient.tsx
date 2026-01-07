"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccountsByOwner } from "@/hooks/useAccounts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  formatAmount,
  formatAmountCompact,
  formatIBAN,
  translateAccountType,
  getAccountTypeBadgeColor,
  calculateTotalBalance,
  groupAccountsByType,
  isOverdrawn,
  calculateAvailableBalance,
} from "@/lib/accounts/utils";
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Wallet,
  CreditCard,
  PiggyBank,
} from "lucide-react";

type DashboardClientProps = {
  userId: string;
};

export default function DashboardClient({ userId }: DashboardClientProps) {
  const router = useRouter();
  const { accounts, isLoading, error, fetchAccounts } =
    useAccountsByOwner(userId);

  useEffect(() => {
    fetchAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Erreur</CardTitle>
          <CardDescription>
            Impossible de charger vos comptes: {error.message}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => fetchAccounts()}>Réessayer</Button>
        </CardContent>
      </Card>
    );
  }

  const totalBalance = calculateTotalBalance(accounts);
  const openAccounts = accounts.filter((a) => a.status === "open");
  const groupedAccounts = groupAccountsByType(openAccounts);

  const stats = [
    {
      title: "Solde total",
      value: formatAmount(totalBalance),
      description: `${openAccounts.length} compte(s) actif(s)`,
      icon: Wallet,
      trend: totalBalance >= 0 ? "up" : "down",
    },
    {
      title: "Comptes courants",
      value: formatAmountCompact(
        calculateTotalBalance(groupedAccounts.current || [])
      ),
      description: `${groupedAccounts.current?.length || 0} compte(s)`,
      icon: CreditCard,
    },
    {
      title: "Épargne",
      value: formatAmountCompact(
        calculateTotalBalance(groupedAccounts.savings || [])
      ),
      description: `${groupedAccounts.savings?.length || 0} compte(s)`,
      icon: PiggyBank,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
          <p className="text-muted-foreground">
            Vue d'ensemble de vos comptes et transactions
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/accounts/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau compte
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const TrendIcon =
            stat.trend === "up"
              ? TrendingUp
              : stat.trend === "down"
              ? TrendingDown
              : null;

          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{stat.value}</div>
                  {TrendIcon && (
                    <TrendIcon
                      className={`h-4 w-4 ${
                        stat.trend === "up" ? "text-green-600" : "text-red-600"
                      }`}
                    />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Accounts List */}
      <Card>
        <CardHeader>
          <CardTitle>Vos comptes</CardTitle>
          <CardDescription>Liste de tous vos comptes bancaires</CardDescription>
        </CardHeader>
        <CardContent>
          {openAccounts.length === 0 ? (
            <div className="text-center py-12">
              <Wallet className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Aucun compte</h3>
              <p className="text-muted-foreground mb-4">
                Commencez par créer votre premier compte bancaire
              </p>
              <Button onClick={() => router.push("/dashboard/accounts/new")}>
                <Plus className="mr-2 h-4 w-4" />
                Créer un compte
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {openAccounts.map((account) => {
                const available = calculateAvailableBalance(account);
                const overdrawn = isOverdrawn(account);

                return (
                  <Card
                    key={account.id}
                    className="cursor-pointer hover:bg-accent transition-colors"
                    onClick={() =>
                      router.push(`/dashboard/accounts/${account.id}`)
                    }
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">
                              {account.accountName}
                            </h3>
                            <Badge
                              className={getAccountTypeBadgeColor(
                                account.accountType
                              )}
                            >
                              {translateAccountType(account.accountType)}
                            </Badge>
                          </div>
                          {account.IBAN && (
                            <p className="text-sm text-muted-foreground font-mono">
                              {formatIBAN(account.IBAN)}
                            </p>
                          )}
                        </div>

                        <div className="text-right space-y-1">
                          <div
                            className={`text-2xl font-bold ${
                              overdrawn ? "text-destructive" : ""
                            }`}
                          >
                            {formatAmount(account.balance)}
                          </div>
                          {account.authorizedOverdraft && (
                            <p className="text-xs text-muted-foreground">
                              Disponible: {formatAmount(available)}
                            </p>
                          )}
                        </div>
                      </div>

                      {overdrawn && (
                        <div className="mt-4 p-3 bg-destructive/10 rounded-md">
                          <p className="text-sm text-destructive font-medium">
                            ⚠️ Compte en découvert
                            {account.overdraftLimit && (
                              <span className="ml-2 font-normal">
                                (Limite: {formatAmount(-account.overdraftLimit)}
                                )
                              </span>
                            )}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Activité récente</CardTitle>
          <CardDescription>Vos dernières transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p>Les transactions s'afficheront ici prochainement</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
