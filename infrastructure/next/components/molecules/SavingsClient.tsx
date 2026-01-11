"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { savingsApi } from "@/api/savings";
import { useAccountsByOwner } from "@/hooks/useAccounts";
import {
  DailyInterest,
  ProcessDailyInterestResult,
  SavingsRate,
} from "@/types/savings";
import { UserRole } from "@/types/users";
import { ApiError } from "@/lib/errors";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, PiggyBank, History, Play } from "lucide-react";
import { formatAmount } from "@/lib/accounts/utils";

type SavingsClientProps = {
  userId: string;
  userRole: UserRole;
};

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const formatRate = (rate: number) => `${rate.toFixed(2)} %`;

export default function SavingsClient({ userId, userRole }: SavingsClientProps) {
  const isManager = userRole === "bankManager";
  const [activeRate, setActiveRate] = useState<SavingsRate | null>(null);
  const [rateHistory, setRateHistory] = useState<SavingsRate[]>([]);
  const [isLoadingRates, setIsLoadingRates] = useState(true);
  const [ratesError, setRatesError] = useState<ApiError | null>(null);

  const [updateRateInput, setUpdateRateInput] = useState({
    rate: "",
    dateEffect: "",
  });
  const [isUpdatingRate, setIsUpdatingRate] = useState(false);
  const [updateRateError, setUpdateRateError] = useState<ApiError | null>(null);
  const [updateRateSuccess, setUpdateRateSuccess] = useState<string | null>(
    null
  );

  const [processDate, setProcessDate] = useState("");
  const [processResult, setProcessResult] =
    useState<ProcessDailyInterestResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processError, setProcessError] = useState<ApiError | null>(null);

  const { accounts, isLoading: isLoadingAccounts, fetchAccounts } =
    useAccountsByOwner(userId);
  const savingsAccounts = useMemo(
    () => accounts.filter((a) => a.accountType === "savings"),
    [accounts]
  );
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    null
  );
  const [interestRange, setInterestRange] = useState({
    from: "",
    to: "",
  });
  const [interests, setInterests] = useState<DailyInterest[]>([]);
  const [isLoadingInterests, setIsLoadingInterests] = useState(false);
  const [interestsError, setInterestsError] = useState<ApiError | null>(null);

  const loadRates = useCallback(async () => {
    setIsLoadingRates(true);
    setRatesError(null);
    try {
      const [active, history] = await Promise.all([
        savingsApi.getActiveRate(),
        savingsApi.getHistory(),
      ]);
      setActiveRate(active);
      setRateHistory(history);
    } catch (error) {
      setRatesError(
        error instanceof ApiError
          ? error
          : new ApiError("INFRASTRUCTURE_ERROR", "Unable to load rates")
      );
    } finally {
      setIsLoadingRates(false);
    }
  }, []);

  useEffect(() => {
    loadRates();
  }, [loadRates]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  useEffect(() => {
    if (savingsAccounts.length > 0 && !selectedAccountId) {
      setSelectedAccountId(savingsAccounts[0].id);
    }
  }, [savingsAccounts, selectedAccountId]);

  const handleUpdateRate = async (event: FormEvent) => {
    event.preventDefault();
    setIsUpdatingRate(true);
    setUpdateRateError(null);
    setUpdateRateSuccess(null);

    const numericRate = Number(updateRateInput.rate);
    if (Number.isNaN(numericRate)) {
      setUpdateRateError(
        new ApiError("VALIDATION_ERROR", "Le taux doit être un nombre.")
      );
      setIsUpdatingRate(false);
      return;
    }

    try {
      const updated = await savingsApi.updateRate({
        rate: numericRate,
        dateEffect: updateRateInput.dateEffect || undefined,
      });
      setActiveRate(updated);
      await loadRates();
      setUpdateRateSuccess("Taux mis à jour.");
    } catch (error) {
      setUpdateRateError(
        error instanceof ApiError
          ? error
          : new ApiError("INFRASTRUCTURE_ERROR", "Unable to update rate")
      );
    } finally {
      setIsUpdatingRate(false);
    }
  };

  const handleProcessInterests = async (event: FormEvent) => {
    event.preventDefault();
    setIsProcessing(true);
    setProcessError(null);
    setProcessResult(null);
    try {
      const result = await savingsApi.processDailyInterest({
        date: processDate || undefined,
      });
      setProcessResult(result);
    } catch (error) {
      setProcessError(
        error instanceof ApiError
          ? error
          : new ApiError("INFRASTRUCTURE_ERROR", "Unable to process interests")
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFetchInterests = async () => {
    if (!selectedAccountId) return;
    setIsLoadingInterests(true);
    setInterestsError(null);
    try {
      const result = await savingsApi.getAccountInterestHistory(
        selectedAccountId,
        {
          from: interestRange.from || undefined,
          to: interestRange.to || undefined,
        }
      );
      setInterests(result);
    } catch (error) {
      setInterestsError(
        error instanceof ApiError
          ? error
          : new ApiError("INFRASTRUCTURE_ERROR", "Unable to load interests")
      );
    } finally {
      setIsLoadingInterests(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground uppercase tracking-wide">
            Épargne
          </p>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <PiggyBank className="h-6 w-6 text-primary" />
            Gestion des comptes épargne
          </h1>
        </div>
        <Button variant="outline" onClick={loadRates}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Actualiser
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Taux actif</CardTitle>
            <CardDescription>
              Taux actuellement appliqué aux comptes épargne pour le calcul quotidien des intérêts.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {isLoadingRates ? (
              <Skeleton className="h-10 w-32" />
            ) : ratesError ? (
              <p className="text-sm text-destructive">{ratesError.message}</p>
            ) : activeRate ? (
              <div className="space-y-2">
                <div className="text-4xl font-bold">
                  {formatRate(activeRate.rate)}
                </div>
                <p className="text-sm text-muted-foreground">
                  Effectif depuis le {formatDate(activeRate.dateEffect)}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Aucun taux actif trouvé.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Historique des taux</CardTitle>
            <CardDescription>Historique des taux d&apos;épargne déjà configurés.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoadingRates ? (
              <Skeleton className="h-32 w-full" />
            ) : rateHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucun taux disponible.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date d&apos;effet</TableHead>
                    <TableHead>Taux</TableHead>
                    <TableHead>ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rateHistory.map((rate) => (
                    <TableRow key={rate.id}>
                      <TableCell>{formatDate(rate.dateEffect)}</TableCell>
                      <TableCell>{formatRate(rate.rate)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {rate.id}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {isManager && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Mise à jour du taux</CardTitle>
              <CardDescription>
                Définissez un nouveau taux d&apos;épargne à appliquer à partir d&apos;une date donnée.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleUpdateRate}>
                <div className="grid gap-2">
                  <Label htmlFor="rate">Nouveau taux (%)</Label>
                  <Input
                    id="rate"
                    type="number"
                    step="0.01"
                    min="0"
                    value={updateRateInput.rate}
                    onChange={(e) =>
                      setUpdateRateInput((prev) => ({
                        ...prev,
                        rate: e.target.value,
                      }))
                    }
                    placeholder="Ex: 2.50"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dateEffect">
                    Date d&apos;effet (optionnel)
                  </Label>
                  <Input
                    id="dateEffect"
                    type="date"
                    value={updateRateInput.dateEffect}
                    onChange={(e) =>
                      setUpdateRateInput((prev) => ({
                        ...prev,
                        dateEffect: e.target.value,
                      }))
                    }
                  />
                </div>
                {updateRateError && (
                  <p className="text-sm text-destructive">
                    {updateRateError.message}
                  </p>
                )}
                {updateRateSuccess && (
                  <p className="text-sm text-green-600">{updateRateSuccess}</p>
                )}
                <Button type="submit" disabled={isUpdatingRate}>
                  {isUpdatingRate ? "Mise à jour..." : "Mettre à jour"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Traitement des intérêts</CardTitle>
              <CardDescription>
                Lance le calcul et la distribution des intérêts journaliers sur les comptes épargne.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleProcessInterests}>
                <div className="grid gap-2">
                  <Label htmlFor="processDate">Date à traiter (optionnel)</Label>
                  <Input
                    id="processDate"
                    type="date"
                    value={processDate}
                    onChange={(e) => setProcessDate(e.target.value)}
                  />
                </div>
                {processError && (
                  <p className="text-sm text-destructive">
                    {processError.message}
                  </p>
                )}
                {processResult && (
                  <div className="text-sm space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {formatDate(processResult.date)}
                      </Badge>
                      <span className="text-muted-foreground">
                        {processResult.processedAccounts} comptes crédités •{" "}
                        {processResult.skippedAccounts} ignorés
                      </span>
                    </div>
                  </div>
                )}
                <Button type="submit" disabled={isProcessing}>
                  <Play className="mr-2 h-4 w-4" />
                  {isProcessing ? "Traitement..." : "Lancer le traitement"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {!isManager && (
        <Card>
          <CardHeader>
            <CardTitle>Historique des intérêts d&apos;un compte</CardTitle>
            <CardDescription>
              Consultez les intérêts versés sur l&apos;un de vos comptes épargne, avec filtre par période.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4 md:items-end">
              <div className="grid gap-2">
                <Label>Compte épargne</Label>
                {isLoadingAccounts ? (
                  <Skeleton className="h-10" />
                ) : savingsAccounts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Aucun compte épargne disponible.
                  </p>
                ) : (
                  <Select
                    value={selectedAccountId ?? undefined}
                    onValueChange={(value) => setSelectedAccountId(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un compte" />
                    </SelectTrigger>
                    <SelectContent>
                      {savingsAccounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.accountName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="from">Du</Label>
                <Input
                  id="from"
                  type="date"
                  value={interestRange.from}
                  onChange={(e) =>
                    setInterestRange((prev) => ({
                      ...prev,
                      from: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="to">Au</Label>
                <Input
                  id="to"
                  type="date"
                  value={interestRange.to}
                  onChange={(e) =>
                    setInterestRange((prev) => ({
                      ...prev,
                      to: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Button
                  className="w-full"
                  onClick={handleFetchInterests}
                  disabled={
                    isLoadingInterests ||
                    isLoadingAccounts ||
                    savingsAccounts.length === 0
                  }
                >
                  <History className="mr-2 h-4 w-4" />
                  {isLoadingInterests ? "Chargement..." : "Charger"}
                </Button>
              </div>
            </div>

            {interestsError && (
              <p className="text-sm text-destructive">{interestsError.message}</p>
            )}

            {isLoadingInterests ? (
              <Skeleton className="h-48 w-full" />
            ) : interests.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucun intérêt calculé sur la période sélectionnée.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Base</TableHead>
                    <TableHead>Taux</TableHead>
                    <TableHead>Intérêt</TableHead>
                    <TableHead>Mode</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {interests.map((interest) => (
                    <TableRow key={interest.id}>
                      <TableCell>{formatDate(interest.date)}</TableCell>
                      <TableCell>{formatAmount(interest.calculationBase)}</TableCell>
                      <TableCell>{formatRate(interest.appliedRate)}</TableCell>
                      <TableCell>
                        {formatAmount(interest.calculatedInterest)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="uppercase">
                          {interest.creditMode}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
