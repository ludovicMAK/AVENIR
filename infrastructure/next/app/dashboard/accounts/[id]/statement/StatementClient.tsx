"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { accountsApi } from "@/api/account";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
} from "@/lib/accounts/utils";
import {
  ArrowLeft,
  Download,
  TrendingUp,
  TrendingDown,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const statementSchema = z
  .object({
    startDate: z.string().min(1, "La date de début est requise"),
    endDate: z.string().min(1, "La date de fin est requise"),
  })
  .refine(
    (data) => {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return start <= end;
    },
    {
      message: "La date de début doit être antérieure à la date de fin",
      path: ["endDate"],
    }
  )
  .refine(
    (data) => {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 365;
    },
    {
      message: "La période ne peut pas dépasser 1 an",
      path: ["endDate"],
    }
  );

type StatementFormValues = z.infer<typeof statementSchema>;

interface StatementClientProps {
  accountId: string;
}

type StatementData = {
  accountId: string;
  accountName: string;
  IBAN: string;
  period: {
    startDate: string;
    endDate: string;
  };
  openingBalance: number;
  closingBalance: number;
  totalDebits: number;
  totalCredits: number;
  transactions: Array<{
    id: string;
    date: string;
    description: string;
    direction: string;
    amount: number;
    balance: number;
  }>;
};

export default function StatementClient({ accountId }: StatementClientProps) {
  const router = useRouter();
  const [statement, setStatement] = useState<StatementData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dates par défaut : dernier mois
  const today = new Date();
  const lastMonth = new Date(today);
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  const form = useForm<StatementFormValues>({
    resolver: zodResolver(statementSchema),
    defaultValues: {
      startDate: lastMonth.toISOString().split("T")[0],
      endDate: today.toISOString().split("T")[0],
    },
  });

  const onSubmit = async (values: StatementFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await accountsApi.getStatement(accountId, {
        startDate: values.startDate,
        endDate: values.endDate,
      });
      setStatement(data);
      toast.success("Relevé généré avec succès");
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erreur lors de la génération du relevé";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
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

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href={`/dashboard/accounts/${accountId}`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour au compte
        </Link>
      </div>

      {/* Period Selection Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Relevé de compte
          </CardTitle>
          <CardDescription>
            Sélectionnez la période pour générer votre relevé de compte
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date de début</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date de fin</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Génération en cours..." : "Générer le relevé"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Statement Display */}
      {statement && (
        <Card>
          <CardHeader className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle className="text-2xl">
                  {statement.accountName}
                </CardTitle>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>IBAN : {formatIBAN(statement.IBAN)}</p>
                  <p>
                    Période : du {formatDate(statement.period.startDate)} au{" "}
                    {formatDate(statement.period.endDate)}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Télécharger PDF
              </Button>
            </div>

            <Separator />

            {/* Summary */}
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Solde initial</p>
                <p className="text-lg font-semibold">
                  {formatAmount(statement.openingBalance)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <TrendingDown className="h-4 w-4 text-destructive" />
                  Total débits
                </p>
                <p className="text-lg font-semibold text-destructive">
                  {formatAmount(statement.totalDebits)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  Total crédits
                </p>
                <p className="text-lg font-semibold text-green-600">
                  {formatAmount(statement.totalCredits)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Solde final</p>
                <p className="text-lg font-semibold">
                  {formatAmount(statement.closingBalance)}
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {statement.transactions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>Aucune transaction sur cette période</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Débit</TableHead>
                      <TableHead className="text-right">Crédit</TableHead>
                      <TableHead className="text-right">Solde</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {statement.transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">
                          {formatDate(transaction.date)}
                        </TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell className="text-right text-destructive">
                          {transaction.direction === "debit"
                            ? formatAmount(transaction.amount)
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right text-green-600">
                          {transaction.direction === "credit"
                            ? formatAmount(transaction.amount)
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatAmount(transaction.balance)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Loading Skeleton */}
      {isLoading && !statement && (
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-96 w-full" />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
