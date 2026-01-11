"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Send, CheckCircle } from "lucide-react";
import Link from "next/link";

const validateIBAN = (iban: string): boolean => {
  const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{10,30}$/;
  return ibanRegex.test(iban.replace(/\s/g, ""));
};

const transferSchema = z
  .object({
    accountIBANFrom: z
      .string()
      .min(1, { message: "Veuillez sélectionner un compte source" }),
    accountIBANTo: z
      .string()
      .min(1, { message: "L'IBAN du destinataire est requis" })
      .refine((val) => validateIBAN(val), {
        message: "IBAN invalide (format: FR76 XXXX XXXX XXXX XXXX XXXX XXX)",
      }),
    amount: z
      .number({ invalid_type_error: "Le montant doit être un nombre" })
      .positive({ message: "Le montant doit être positif" })
      .min(0.01, { message: "Le montant minimum est 0.01€" }),
    reason: z
      .string()
      .min(3, { message: "La description doit contenir au moins 3 caractères" })
      .max(200, {
        message: "La description ne peut pas dépasser 200 caractères",
      }),
    dateExecuted: z
      .string()
      .min(1, { message: "La date d'exécution est requise" }),
  })
  .refine((data) => data.accountIBANFrom !== data.accountIBANTo, {
    message:
      "Le compte destinataire ne peut pas être le même que le compte source",
    path: ["accountIBANTo"],
  });

interface NewTransferClientProps {
  userId: string;
}

type TransferFormValues = z.infer<typeof transferSchema>;

export default function NewTransferClient({ userId }: NewTransferClientProps) {
  const router = useRouter();
  const {
    accounts,
    isLoading: loadingAccounts,
    fetchAccounts,
  } = useAccountsByOwner(userId);
  const { createTransfer, isLoading, error } = useCreateTransfer();

  const [showConfirmation, setShowConfirmation] = useState(false);

  const form = useForm<TransferFormValues>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      accountIBANFrom: "",
      accountIBANTo: "",
      amount: undefined,
      reason: "",
      dateExecuted: new Date().toISOString().split("T")[0],
    },
  });

  useEffect(() => {
    if (userId) {
      fetchAccounts();
    }
  }, [userId, fetchAccounts]);

  const selectedAccount = accounts.find(
    (acc: Account) => acc.id === form.watch("accountIBANFrom")
  );

  const onSubmit = (data: TransferFormValues) => {
    setShowConfirmation(true);
  };

  const handleConfirm = async () => {
    const values = form.getValues();
    const account = accounts.find((acc) => acc.id === values.accountIBANFrom);

    if (!account) return;

    try {
      const cleanIBANFrom = account.IBAN!.replace(/\s/g, "");
      const cleanIBANTo = values.accountIBANTo.replace(/\s/g, "");

      await createTransfer({
        accountIBANFrom: cleanIBANFrom,
        accountIBANTo: cleanIBANTo,
        amount: values.amount,
        dateExecuted: new Date(values.dateExecuted).toISOString(),
        description: values.reason,
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
    const values = form.getValues();
    const account = accounts.find((acc) => acc.id === values.accountIBANFrom);

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
                <p className="text-sm text-muted-foreground">Compte source</p>
                <p className="font-medium">{account?.accountName}</p>
                <p className="text-sm text-muted-foreground font-mono">
                  {account?.IBAN}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Compte destinataire
                </p>
                <p className="text-sm font-mono">{values.accountIBANTo}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Montant</p>
                <p className="text-2xl font-bold text-primary">
                  {values.amount.toFixed(2)} €
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Date d'exécution
                </p>
                <p className="font-medium">
                  {new Date(values.dateExecuted).toLocaleDateString("fr-FR")}
                </p>
              </div>

              {values.reason && (
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p>{values.reason}</p>
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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="accountIBANFrom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Compte source *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un compte" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {accounts
                          .filter((acc: Account) => acc.status === "open")
                          .map((account: Account) => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.accountName} -{" "}
                              {account.balance.toFixed(2)} €
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    {selectedAccount && (
                      <FormDescription>
                        Solde disponible: {selectedAccount.balance.toFixed(2)} €
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="accountIBANTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IBAN destinataire *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value.toUpperCase().replace(/\s/g, "")
                          )
                        }
                        placeholder="FR76123456789012345678901"
                      />
                    </FormControl>
                    <FormDescription>
                      Format: FR76 suivi de 23 caractères alphanumériques
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Montant (€) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => {
                          const value =
                            e.target.value === ""
                              ? undefined
                              : parseFloat(e.target.value);
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dateExecuted"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date d'exécution *</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        min={new Date().toISOString().split("T")[0]}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Objet du virement"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Entre 3 et 200 caractères</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error.message}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="w-full"
              >
                Continuer
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
