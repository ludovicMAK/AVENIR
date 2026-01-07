"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { accountsApi } from "@/api/account";
import { useAccountTransactions } from "@/hooks/useAccountTransactions";
import { Account } from "@/types/accounts";
import { ApiError } from "@/lib/errors";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatAmount,
  formatIBAN,
  translateAccountType,
  getAccountTypeBadgeColor,
  isOverdrawn,
  calculateAvailableBalance,
} from "@/lib/accounts/utils";
import {
  ArrowLeft,
  Edit,
  XCircle,
  FileText,
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { CloseAccountDialog } from "@/components/CloseAccountDialog";

interface AccountDetailClientProps {
  accountId: string;
  userId: string;
}

export default function AccountDetailClient({
  accountId,
  userId,
}: AccountDetailClientProps) {
  const router = useRouter();
  const [account, setAccount] = useState<Account | null>(null);
  const [isLoadingAccount, setIsLoadingAccount] = useState(true);
  const [accountError, setAccountError] = useState<ApiError | Error | null>(
    null
  );

  const {
    transactions,
    pagination,
    isLoading: isLoadingTransactions,
    error: transactionsError,
    fetchTransactions,
  } = useAccountTransactions(accountId);

  const [currentPage, setCurrentPage] = useState(1);
  const limit = 20;
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);

  // Charger les données du compte
  useEffect(() => {
    async function loadAccount() {
      setIsLoadingAccount(true);
      setAccountError(null);

      try {
        const accountData = await accountsApi.getById(accountId);
        setAccount(accountData);
      } catch (err) {
        const error =
          err instanceof ApiError || err instanceof Error
            ? err
            : new Error("Erreur lors du chargement du compte");
        setAccountError(error);
      } finally {
        setIsLoadingAccount(false);
      }
    }

    loadAccount();
  }, [accountId]);

  // Rediriger après fermeture du compte
  const handleCloseSuccess = () => {
    router.push("/dashboard/accounts");
  };

  // Charger les transactions
  useEffect(() => {
    fetchTransactions({ page: currentPage, limit });
  }, [currentPage, fetchTransactions]);

  const handlePageChange = (newPage: number) => {
    if (pagination && newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoadingAccount) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (accountError || !account) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Erreur</CardTitle>
          <CardDescription>
            {accountError?.message || "Compte introuvable"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.push("/dashboard/accounts")}>
            Retour aux comptes
          </Button>
        </CardContent>
      </Card>
    );
  }

  const available = calculateAvailableBalance(account);
  const overdrawn = isOverdrawn(account);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/accounts"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux comptes
        </Link>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              router.push(`/dashboard/accounts/${accountId}/statement`)
            }
          >
            <FileText className="mr-2 h-4 w-4" />
            Relevé
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive"
            onClick={() => setCloseDialogOpen(true)}
          >
            <XCircle className="mr-2 h-4 w-4" />
            Fermer le compte
          </Button>
        </div>
      </div>

      {/* Account Info Card */}
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <CardTitle className="text-3xl font-bold">
                  {account.accountName}
                </CardTitle>
                <Badge
                  className={getAccountTypeBadgeColor(account.accountType)}
                >
                  {translateAccountType(account.accountType)}
                </Badge>
                {account.status === "close" && (
                  <Badge variant="destructive">Fermé</Badge>
                )}
              </div>
              {account.IBAN && (
                <p className="text-muted-foreground font-mono text-sm">
                  {formatIBAN(account.IBAN)}
                </p>
              )}
            </div>

            <div className="text-right space-y-1">
              <p className="text-sm text-muted-foreground">Solde actuel</p>
              <p
                className={`text-4xl font-bold ${
                  overdrawn ? "text-destructive" : ""
                }`}
              >
                {formatAmount(account.balance)}
              </p>
              {account.authorizedOverdraft && (
                <p className="text-sm text-muted-foreground">
                  Disponible: {formatAmount(available)}
                </p>
              )}
            </div>
          </div>
        </CardHeader>

        {account.authorizedOverdraft && (
          <>
            <Separator />
            <CardContent className="pt-6">
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Découvert autorisé
                  </p>
                  <p className="text-lg font-semibold">
                    {formatAmount(-account.overdraftLimit!)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Frais de découvert
                  </p>
                  <p className="text-lg font-semibold">
                    {account.overdraftFees}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">État</p>
                  {overdrawn ? (
                    <Badge variant="destructive">En découvert</Badge>
                  ) : (
                    <Badge className="bg-success text-white">Normal</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </>
        )}
      </Card>

      {/* Transactions Card */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>
            Historique des opérations sur ce compte
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingTransactions ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : transactionsError ? (
            <div className="text-center py-8">
              <p className="text-destructive mb-4">
                {transactionsError.message}
              </p>
              <Button onClick={() => fetchTransactions({ page: 1, limit })}>
                Réessayer
              </Button>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Aucune transaction pour le moment</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Heure</TableHead>
                    <TableHead>Libellé</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => {
                    const isCredit =
                      transaction.transactionDirection === "credit";
                    const Icon = isCredit ? TrendingUp : TrendingDown;

                    return (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">
                          {formatDate(transaction.accountDate)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatTime(transaction.accountDate)}
                        </TableCell>
                        <TableCell>{transaction.reason}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Icon
                              className={`h-4 w-4 ${
                                isCredit ? "text-success" : "text-destructive"
                              }`}
                            />
                            <span className="text-sm">
                              {isCredit ? "Crédit" : "Débit"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={`font-semibold ${
                              isCredit ? "text-success" : "text-destructive"
                            }`}
                          >
                            {isCredit ? "+" : "-"}
                            {formatAmount(Math.abs(transaction.amount))}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              transaction.status === "validated"
                                ? "default"
                                : transaction.status === "pending"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {transaction.status === "validated"
                              ? "Validé"
                              : transaction.status === "pending"
                              ? "En attente"
                              : "Rejeté"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-muted-foreground">
                    Page {pagination.page} sur {pagination.totalPages} (
                    {pagination.total} transaction(s) au total)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Précédent
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === pagination.totalPages}
                    >
                      Suivant
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Close Account Dialog */}
      {account && (
        <CloseAccountDialog
          account={account}
          open={closeDialogOpen}
          onOpenChange={setCloseDialogOpen}
          onSuccess={handleCloseSuccess}
        />
      )}
    </div>
  );
}
