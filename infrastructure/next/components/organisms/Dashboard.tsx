"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccountsByOwner } from "@/hooks/useAccounts";
import { useTransferHistory } from "@/hooks/useTransfers";
import { useNotifications } from "@/hooks/useNotifications";
import { useActivities } from "@/hooks/useActivities";
import { ActivityFeed } from "@/components/molecules/ActivityFeed";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/atoms/Card";
import { Badge } from "@/components/atoms/Badge";
import { Skeleton } from "@/components/atoms/Skeleton";
import { Button } from "@/components/atoms/Button";
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
  ArrowDownLeft,
  ArrowUpRight,
  Bell,
} from "lucide-react";
import { useTranslations } from "@/lib/i18n/simple-i18n";

type DashboardClientProps = {
  userId: string;
};

export default function Dashboard({ userId }: DashboardClientProps) {
  const router = useRouter();
  const { accounts, isLoading, error, fetchAccounts } =
    useAccountsByOwner(userId);
  const { transfers, isLoading: isLoadingTransfers } = useTransferHistory();
  const { notifications } = useNotifications();
  const { activities } = useActivities();
  
  const tDashboard = useTranslations('dashboard');

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

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
          <CardTitle className="text-destructive">{useTranslations('common')('error')}</CardTitle>
          <CardDescription>
            Impossible de charger vos comptes: {error.message}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => fetchAccounts()}>{useTranslations('common')('retry')}</Button>
        </CardContent>
      </Card>
    );
  }

  const totalBalance = calculateTotalBalance(accounts);
  const openAccounts = accounts.filter((a) => a.status === "open");
  const groupedAccounts = groupAccountsByType(openAccounts);

  const stats = [
    {
      title: tDashboard('totalBalance'),
      value: formatAmount(totalBalance),
      description: `${openAccounts.length} ${tDashboard('accounts_count')}`,
      icon: Wallet,
      trend: totalBalance >= 0 ? "up" : "down",
    },
    {
      title: tDashboard('currentAccounts'),
      value: formatAmountCompact(
        calculateTotalBalance(groupedAccounts.current || [])
      ),
      description: `${groupedAccounts.current?.length || 0} ${tDashboard('accounts_count')}`,
      icon: CreditCard,
    },
    {
      title: tDashboard('savingsAccounts'),
      value: formatAmountCompact(
        calculateTotalBalance(groupedAccounts.savings || [])
      ),
      description: `${groupedAccounts.savings?.length || 0} ${tDashboard('accounts_count')}`,
      icon: PiggyBank,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{tDashboard('title')}</h1>
          <p className="text-muted-foreground">
            {tDashboard('subtitle')}
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/accounts/new")}>
          <Plus className="mr-2 h-4 w-4" />
          {tDashboard('newAccount')}
        </Button>
      </div>

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

      <Card>
        <CardHeader>
          <CardTitle>{tDashboard('yourAccounts')}</CardTitle>
          <CardDescription>{tDashboard('accountsList')}</CardDescription>
        </CardHeader>
        <CardContent>
          {openAccounts.length === 0 ? (
            <div className="text-center py-12">
              <Wallet className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">{tDashboard('noAccounts')}</h3>
              <p className="text-muted-foreground mb-4">
                {tDashboard('noAccountsDesc')}
              </p>
              <Button onClick={() => router.push("/dashboard/accounts/new")}>
                <Plus className="mr-2 h-4 w-4" />
                {tDashboard('createAccount')}
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
                              {tDashboard('available')}: {formatAmount(available)}
                            </p>
                          )}
                        </div>
                      </div>

                      {overdrawn && (
                        <div className="mt-4 p-3 bg-destructive/10 rounded-md">
                          <p className="text-sm text-destructive font-medium">
                            ⚠️ {tDashboard('overdraft')}
                            {account.overdraftLimit && (
                              <span className="ml-2 font-normal">
                                ({tDashboard('limit')}: {formatAmount(-account.overdraftLimit)})
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

      <Card>
        <CardHeader>
          <CardTitle>{tDashboard('recentActivity')}</CardTitle>
          <CardDescription>{tDashboard('latestTransactions')}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingTransfers ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : transfers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>{tDashboard('noTransactions')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transfers.slice(0, 5).map((transaction) => {
                const isDebit = transaction.transactionDirection === "debit";
                const formatDate = (dateString: string) => {
                  const date = new Date(dateString);
                  return date.toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  });
                };

                return (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-2 rounded-full ${
                          isDebit
                            ? "bg-red-100 text-red-600"
                            : "bg-green-100 text-green-600"
                        }`}
                      >
                        {isDebit ? (
                          <ArrowUpRight className="h-4 w-4" />
                        ) : (
                          <ArrowDownLeft className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {transaction.reason || "Virement"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {typeof transaction.dateRequested === "string" && transaction.dateRequested
                            ? formatDate(transaction.dateRequested)
                            : ""}
                          {transaction.counterpartyIBAN && (
                            <> • {formatIBAN(transaction.counterpartyIBAN)}</>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-semibold ${
                          isDebit ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        {isDebit ? "-" : "+"}
                        {formatAmount(transaction.amount)}
                      </p>
                      <Badge
                        variant={
                          transaction.status === "POSTED"
                            ? "default"
                            : "secondary"
                        }
                        className="text-xs"
                      >
                        {transaction.status === "POSTED"
                          ? "Exécuté"
                          : transaction.status}
                      </Badge>
                    </div>
                  </div>
                );
              })}
              {transfers.length > 5 && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push("/dashboard/transfers")}
                >
                  Voir toutes les transactions
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notifications Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications Récentes
            </CardTitle>
            <CardDescription>Vos notifications les plus récentes</CardDescription>
          </CardHeader>
          <CardContent>
            {notifications.slice(0, 5).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Aucune notification</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.slice(0, 5).map((notification) => (
                  <div
                    key={notification.id}
                    className="p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{notification.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(notification.createdAt).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      <Badge variant={notification.isRead ? "secondary" : "default"}>
                        {notification.isRead ? "Lue" : "Nouvelle"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {notifications.length > 5 && (
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => router.push("/notifications")}
              >
                Voir toutes les notifications
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Activities Section */}
        <Card>
          <CardHeader>
            <CardTitle>Activités</CardTitle>
            <CardDescription>Dernières activités du compte</CardDescription>
          </CardHeader>
          <CardContent>
            <ActivityFeed limit={5} />
            {activities.length > 5 && (
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => router.push("/activities")}
              >
                Voir toutes les activités
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
