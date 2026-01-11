"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccountsByOwner } from "@/hooks/useAccounts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/Card";
import { Button } from "@/components/atoms/Button";
import { Badge } from "@/components/atoms/Badge";
import { Input } from "@/components/atoms/Input";
import { Skeleton } from "@/components/atoms/Skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/atoms/Tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/Select";
import {
  formatAmount,
  formatIBAN,
  translateAccountType,
  getAccountTypeBadgeColor,
  filterAccountsByType,
  filterAccountsByStatus,
  sortAccountsByBalance,
  sortAccountsByName,
  searchAccounts,
  calculateTotalBalance,
  calculateAvailableBalance,
  isOverdrawn,
} from "@/lib/accounts/utils";
import { AccountTypeValue, AccountStatusValue } from "@/types/accounts";
import { Plus, Search, ArrowUpDown, Wallet } from "lucide-react";
import { useTranslations } from "@/lib/i18n/simple-i18n";

type AccountsClientProps = {
  userId: string;
};

export default function Accounts({ userId }: AccountsClientProps) {
  const router = useRouter();
  const { accounts, isLoading, error, fetchAccounts } =
    useAccountsByOwner(userId);
  const t = useTranslations('accounts');
  const tCommon = useTranslations('common');

  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<AccountTypeValue[]>([]);
  const [statusFilter, setStatusFilter] = useState<AccountStatusValue[]>([
    "open",
  ]);
  const [sortBy, setSortBy] = useState<"name" | "balance">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <Skeleton className="h-12 w-full" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">{t('error')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            {t('loadError')}: {error.message}
          </p>
          <Button onClick={() => fetchAccounts()}>{t('retry')}</Button>
        </CardContent>
      </Card>
    );
  }

  let filteredAccounts = searchAccounts(accounts, searchQuery);
  filteredAccounts = filterAccountsByType(filteredAccounts, typeFilter);
  filteredAccounts = filterAccountsByStatus(filteredAccounts, statusFilter);

  if (sortBy === "name") {
    filteredAccounts = sortAccountsByName(filteredAccounts, sortOrder);
  } else {
    filteredAccounts = sortAccountsByBalance(filteredAccounts, sortOrder);
  }

  const totalBalance = calculateTotalBalance(filteredAccounts);
  const accountsByType = {
    current: filteredAccounts.filter((a) => a.accountType === "current"),
    savings: filteredAccounts.filter((a) => a.accountType === "savings"),
    trading: filteredAccounts.filter((a) => a.accountType === "trading"),
  };

  const toggleSort = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">
            {filteredAccounts.length} {tCommon('accounts_count')} • {t('totalBalance')}:{" "}
            {formatAmount(totalBalance)}
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/accounts/new")}>
          <Plus className="mr-2 h-4 w-4" />
          {t('newAccount')}
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select
              value={sortBy}
              onValueChange={(value: "name" | "balance") => setSortBy(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('sortBy')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">{t('name')}</SelectItem>
                <SelectItem value="balance">{t('balance')}</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={toggleSort}>
              <ArrowUpDown className="mr-2 h-4 w-4" />
              {sortOrder === "asc" ? t('ascending') : t('descending')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">
            {t('all')} ({filteredAccounts.length})
          </TabsTrigger>
          <TabsTrigger value="current">
            {t('currentAccounts')} ({accountsByType.current.length})
          </TabsTrigger>
          <TabsTrigger value="savings">
            {t('savingsAccounts')} ({accountsByType.savings.length})
          </TabsTrigger>
          <TabsTrigger value="trading">
            {t('tradingAccounts')} ({accountsByType.trading.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredAccounts.length === 0 ? (
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <Wallet className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {t('noAccounts')}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery
                    ? t('tryOtherSearch')
                    : t('createFirst')}
                </p>
                {!searchQuery && (
                  <Button
                    onClick={() => router.push("/dashboard/accounts/new")}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {t('createAccount')}
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredAccounts.map((account) => {
                const available = calculateAvailableBalance(account);
                const overdrawn = isOverdrawn(account);

                return (
                  <Card
                    key={account.id}
                    className="cursor-pointer hover:border-primary transition-colors"
                    onClick={() =>
                      router.push(`/dashboard/accounts/${account.id}`)
                    }
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <CardTitle className="text-lg">
                            {account.accountName}
                          </CardTitle>
                          {account.IBAN && (
                            <p className="text-xs text-muted-foreground font-mono">
                              {formatIBAN(account.IBAN)}
                            </p>
                          )}
                        </div>
                        <Badge
                          className={getAccountTypeBadgeColor(
                            account.accountType
                          )}
                        >
                          {translateAccountType(account.accountType)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div
                          className={`text-2xl font-bold ${
                            overdrawn ? "text-destructive" : ""
                          }`}
                        >
                          {formatAmount(account.balance)}
                        </div>
                        {account.authorizedOverdraft && (
                          <p className="text-sm text-muted-foreground">
                            {t('available')}: {formatAmount(available)}
                          </p>
                        )}
                        {overdrawn && (
                          <div className="mt-3 p-2 bg-destructive/10 rounded text-xs text-destructive">
                            ⚠️ {t('overdraft')}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="current" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {accountsByType.current.map((account) => {
              const available = calculateAvailableBalance(account);
              const overdrawn = isOverdrawn(account);

              return (
                <Card
                  key={account.id}
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() =>
                    router.push(`/dashboard/accounts/${account.id}`)
                  }
                >
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {account.accountName}
                    </CardTitle>
                    {account.IBAN && (
                      <p className="text-xs text-muted-foreground font-mono">
                        {formatIBAN(account.IBAN)}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`text-2xl font-bold mb-1 ${
                        overdrawn ? "text-destructive" : ""
                      }`}
                    >
                      {formatAmount(account.balance)}
                    </div>
                    {account.authorizedOverdraft && (
                      <p className="text-sm text-muted-foreground">
                        {t('available')}: {formatAmount(available)}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="savings" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {accountsByType.savings.map((account) => (
              <Card
                key={account.id}
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => router.push(`/dashboard/accounts/${account.id}`)}
              >
                <CardHeader>
                  <CardTitle className="text-lg">
                    {account.accountName}
                  </CardTitle>
                  {account.IBAN && (
                    <p className="text-xs text-muted-foreground font-mono">
                      {formatIBAN(account.IBAN)}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatAmount(account.balance)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trading" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {accountsByType.trading.map((account) => (
              <Card
                key={account.id}
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => router.push(`/dashboard/accounts/${account.id}`)}
              >
                <CardHeader>
                  <CardTitle className="text-lg">
                    {account.accountName}
                  </CardTitle>
                  {account.IBAN && (
                    <p className="text-xs text-muted-foreground font-mono">
                      {formatIBAN(account.IBAN)}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatAmount(account.balance)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
