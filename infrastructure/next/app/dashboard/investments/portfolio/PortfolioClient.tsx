"use client";

import { useRouter } from "next/navigation";
import { usePositions } from "@/hooks/useOrders";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TrendingUp, TrendingDown, Briefcase, PieChart } from "lucide-react";

export default function PortfolioClient() {
  const router = useRouter();
  const { positions, isLoading, error } = usePositions();

  // Calculs
  const totalValue = positions.reduce((sum, p) => sum + p.totalValue, 0);
  const totalInvested = positions.reduce(
    (sum, p) => sum + p.quantity * p.averagePrice,
    0
  );
  const totalGainLoss = totalValue - totalInvested;
  const totalGainLossPercentage =
    totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;
  const isPositiveTotal = totalGainLoss >= 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Mon portefeuille</h1>
          <p className="text-muted-foreground">
            Vue d&apos;ensemble de vos investissements
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
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
        <Card className="border-destructive/50">
          <CardContent className="p-12 text-center">
            <p className="text-destructive">
              Erreur lors du chargement du portefeuille
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {error.message}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mon portefeuille</h1>
          <p className="text-muted-foreground">
            Vue d&apos;ensemble de vos investissements
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/investments/market")}>
          Investir
        </Button>
      </div>

      {/* Stats principales */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Valeur totale</CardDescription>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalValue.toFixed(2)} €</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Investi</CardDescription>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalInvested.toFixed(2)} €
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Plus/Moins-value</CardDescription>
              {isPositiveTotal ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                isPositiveTotal ? "text-green-600" : "text-red-600"
              }`}
            >
              {totalGainLoss > 0 ? "+" : ""}
              {totalGainLoss.toFixed(2)} €
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Rendement</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                isPositiveTotal ? "text-green-600" : "text-red-600"
              }`}
            >
              {totalGainLossPercentage > 0 ? "+" : ""}
              {totalGainLossPercentage.toFixed(2)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Positions détaillées */}
      <Card>
        <CardHeader>
          <CardTitle>Mes positions</CardTitle>
          <CardDescription>
            Détail de vos actions détenues ({positions.length}{" "}
            {positions.length > 1 ? "positions" : "position"})
          </CardDescription>
        </CardHeader>
        <CardContent>
          {positions.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">
                Aucune position dans votre portefeuille
              </p>
              <p className="text-muted-foreground mb-6">
                Commencez à investir dès maintenant sur le marché
              </p>
              <Button
                onClick={() => router.push("/dashboard/investments/market")}
              >
                Découvrir le marché
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead className="text-right">Quantité</TableHead>
                  <TableHead className="text-right">Prix moyen d&apos;achat</TableHead>
                  <TableHead className="text-right">Prix actuel</TableHead>
                  <TableHead className="text-right">Valeur totale</TableHead>
                  <TableHead className="text-right">Plus/Moins-value</TableHead>
                  <TableHead className="text-right">Rendement</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {positions.map((position) => {
                  const isPositive = position.gainLoss >= 0;
                  return (
                    <TableRow key={position.shareId}>
                      <TableCell className="font-medium">
                        {position.shareName}
                      </TableCell>
                      <TableCell className="text-right">
                        {position.quantity}
                      </TableCell>
                      <TableCell className="text-right">
                        {position.averagePrice.toFixed(2)} €
                      </TableCell>
                      <TableCell className="text-right">
                        {position.currentPrice.toFixed(2)} €
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {position.totalValue.toFixed(2)} €
                      </TableCell>
                      <TableCell
                        className={`text-right font-medium ${
                          isPositive ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        <div className="flex items-center justify-end gap-1">
                          {isPositive ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {position.gainLoss > 0 ? "+" : ""}
                          {position.gainLoss.toFixed(2)} €
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant={isPositive ? "default" : "destructive"}
                          className="gap-1"
                        >
                          {position.gainLossPercentage > 0 ? "+" : ""}
                          {position.gainLossPercentage.toFixed(2)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            router.push(
                              `/dashboard/investments/market/${position.shareId}`
                            )
                          }
                        >
                          Voir
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
