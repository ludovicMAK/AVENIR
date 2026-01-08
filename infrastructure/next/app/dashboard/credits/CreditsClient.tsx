"use client";

import { useRouter } from "next/navigation";
import { useCredits } from "@/hooks/useCredits";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CreditCard,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function CreditsClient() {
  const router = useRouter();
  const { credits, isLoading, error } = useCredits();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="default" className="gap-1">
            <Clock className="h-3 w-3" />
            En cours
          </Badge>
        );
      case "paid":
        return (
          <Badge variant="default" className="gap-1 bg-green-600">
            <CheckCircle className="h-3 w-3" />
            Remboursé
          </Badge>
        );
      case "overdue":
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            En retard
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getNextDueDate = (credit: typeof credits[0]) => {
    if (!credit.dueDates || !Array.isArray(credit.dueDates)) {
      return null;
    }
    const unpaidDueDates = credit.dueDates
      .filter((dd) => dd.status === "pending" || dd.status === "overdue")
      .sort(
        (a, b) =>
          new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      );
    return unpaidDueDates[0];
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Mes crédits</h1>
          <p className="text-muted-foreground">
            Gérez vos crédits et échéances
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Mes crédits</h1>
          <p className="text-muted-foreground">
            Gérez vos crédits et échéances
          </p>
        </div>
        <Card className="border-destructive/50">
          <CardContent className="p-12 text-center">
            <p className="text-destructive">
              Erreur lors du chargement des crédits
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {error.message}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalBorrowed = credits.reduce((sum, c) => sum + c.amountBorrowed, 0);
  const totalRemaining = credits.reduce((sum, c) => sum + c.remainingAmount, 0);
  const totalPaid = credits.reduce((sum, c) => sum + c.totalPaid, 0);
  const activeCredits = credits.filter((c) => c.status === "active");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mes crédits</h1>
          <p className="text-muted-foreground">
            Gérez vos crédits et échéances
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/credits/simulator")}>
          <TrendingUp className="mr-2 h-4 w-4" />
          Simuler un crédit
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Crédits actifs</CardDescription>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCredits.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Total emprunté</CardDescription>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalBorrowed.toFixed(2)} €
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Restant à payer</CardDescription>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalRemaining.toFixed(2)} €
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Total payé</CardDescription>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPaid.toFixed(2)} €</div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des crédits */}
      {credits.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">Aucun crédit en cours</p>
            <p className="text-muted-foreground mb-6">
              Simulez un crédit pour voir les conditions
            </p>
            <Button onClick={() => router.push("/dashboard/credits/simulator")}>
              Simuler un crédit
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {credits.map((credit) => {
            const nextDueDate = getNextDueDate(credit);
            const progressPercentage =
              (credit.totalPaid / credit.totalAmountDue) * 100;

            return (
              <Card
                key={credit.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/dashboard/credits/${credit.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Crédit #{credit.id?.slice(0, 8) || 'N/A'}
                        {getStatusBadge(credit.status)}
                      </CardTitle>
                      <CardDescription>
                        Accordé le{" "}
                        {format(new Date(credit.dateGranted), "dd MMMM yyyy", {
                          locale: fr,
                        })}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        {credit.monthlyPayment.toFixed(2)} €
                      </p>
                      <p className="text-sm text-muted-foreground">
                        par mois
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Progression */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progression</span>
                      <span className="font-medium">
                        {progressPercentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Détails */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-sm text-muted-foreground">Emprunté</p>
                      <p className="font-medium">
                        {credit.amountBorrowed.toFixed(2)} €
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Restant</p>
                      <p className="font-medium">
                        {credit.remainingAmount.toFixed(2)} €
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Durée</p>
                      <p className="font-medium">
                        {credit.durationInMonths} mois
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Taux</p>
                      <p className="font-medium">
                        {credit.annualRate.toFixed(2)}%
                      </p>
                    </div>
                  </div>

                  {/* Prochaine échéance */}
                  {nextDueDate && (
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">
                            Prochaine échéance
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(nextDueDate.dueDate), "dd MMMM yyyy", {
                              locale: fr,
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">
                          {nextDueDate.amountDue.toFixed(2)} €
                        </p>
                        {nextDueDate.status === "overdue" && (
                          <Badge variant="destructive" className="mt-1">
                            En retard
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
