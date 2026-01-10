"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCreateTransfer } from "@/hooks/useTransfers";
import { useAccountsByOwner } from "@/hooks/useAccounts";
import { Account } from "@/types/accounts";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Send, CheckCircle } from "lucide-react";
import Link from "next/link";

interface NewTransferClientProps {
  userId: string;
}

export default function NewTransferClient({ userId }: NewTransferClientProps) {
  const router = useRouter();
  const {
    accounts,
    isLoading: loadingAccounts,
    fetchAccounts,
  } = useAccountsByOwner(userId);
  const { createTransfer, isLoading, error } = useCreateTransfer();

  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [accountIBANTo, setAccountIBANTo] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [dateExecuted, setDateExecuted] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [ibanError, setIbanError] = useState("");

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setDateExecuted(today);

    if (userId) {
      fetchAccounts();
    }
  }, [userId, fetchAccounts]);

  const selectedAccount = accounts.find(
    (acc: Account) => acc.id === selectedAccountId
  );

  const validateIBAN = (iban: string): boolean => {
    const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/;
    return ibanRegex.test(iban.replace(/\s/g, ""));
  };

  const handleIBANChange = (value: string) => {
    const cleanIBAN = value.toUpperCase().replace(/\s/g, "");
    setAccountIBANTo(cleanIBAN);

    if (cleanIBAN && !validateIBAN(cleanIBAN)) {
      setIbanError("IBAN invalide");
    } else {
      setIbanError("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAccount || !accountIBANTo || !amount || !dateExecuted) {
      return;
    }

    if (!validateIBAN(accountIBANTo)) {
      setIbanError("Invalid IBAN");
      return;
    }

    if (selectedAccount.IBAN === accountIBANTo) {
      setIbanError(
        "The destination account cannot be the same as the source account"
      );
      return;
    }

    setShowConfirmation(true);
  };

  const handleConfirm = async () => {
    if (!selectedAccount) return;

    try {
      const cleanIBANFrom = selectedAccount.IBAN!.replace(/\s/g, "");
      const cleanIBANTo = accountIBANTo.replace(/\s/g, "");

      await createTransfer({
        accountIBANFrom: cleanIBANFrom,
        accountIBANTo: cleanIBANTo,
        amount: parseFloat(amount),
        dateExecuted: new Date(dateExecuted).toISOString(),
        description: description,
        direction: "debit",
      });

      router.push("/dashboard/transfers");
      router.refresh();
    } catch (err) {
      setShowConfirmation(false);
    }
  };

  if (loadingAccounts) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (showConfirmation) {
    return (
      <div className="space-y-6">
        <Link
          href="/dashboard/transfers/new"
          onClick={() => setShowConfirmation(false)}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour au formulaire
        </Link>

        <Card className="border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>Confirmation du virement</CardTitle>
                <CardDescription>
                  Vérifiez les informations avant de confirmer
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Compte source</Label>
                <p className="font-medium">{selectedAccount?.accountName}</p>
                <p className="text-sm text-muted-foreground font-mono">
                  {selectedAccount?.IBAN}
                </p>
              </div>

              <div>
                <Label className="text-muted-foreground">
                  Compte destinataire
                </Label>
                <p className="text-sm font-mono">{accountIBANTo}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Montant</Label>
                <p className="text-2xl font-bold text-primary">{amount} €</p>
              </div>

              <div>
                <Label className="text-muted-foreground">
                  Date d'exécution
                </Label>
                <p className="font-medium">
                  {new Date(dateExecuted).toLocaleDateString("fr-FR")}
                </p>
              </div>

              {description && (
                <div>
                <Label className="text-muted-foreground">Description</Label>
                <p>{description}</p>
              </div>
            )}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error.message}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3">
              <Button
                onClick={() => setShowConfirmation(false)}
                variant="outline"
                disabled={isLoading}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? "Traitement..." : "Confirmer le virement"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/transfers"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour aux virements
      </Link>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Send className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>Nouveau virement</CardTitle>
              <CardDescription>
                Effectuez un virement vers un autre compte
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="accountFrom">Compte source *</Label>
              <Select
                value={selectedAccountId}
                onValueChange={setSelectedAccountId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un compte" />
                </SelectTrigger>
                <SelectContent>
                  {accounts
                    .filter((acc: Account) => acc.status === "open")
                    .map((account: Account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.accountName} - {account.balance.toFixed(2)} €
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {selectedAccount && (
                <p className="text-sm text-muted-foreground">
                  Solde disponible: {selectedAccount.balance.toFixed(2)} €
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ibanTo">IBAN destinataire *</Label>
              <Input
                id="ibanTo"
                value={accountIBANTo}
                onChange={(e) => handleIBANChange(e.target.value)}
                placeholder="FR76 1234 5678 9012 3456 7890 123"
                className={ibanError ? "border-destructive" : ""}
              />
              {ibanError && (
                <p className="text-sm text-destructive">{ibanError}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Montant (€) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateExecuted">Date d'exécution *</Label>
              <Input
                id="dateExecuted"
                type="date"
                value={dateExecuted}
                onChange={(e) => setDateExecuted(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Objet du virement (optionnel)"
                rows={3}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error.message}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              disabled={
                !selectedAccountId ||
                !accountIBANTo ||
                !amount ||
                !dateExecuted ||
                !!ibanError
              }
              className="w-full"
            >
              Continuer
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
