"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Filter, ArrowUpDown, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useTransferHistory } from "@/hooks/useTransfers";

interface TransfersClientProps {
  userId: string;
}

export default function TransfersClient({ userId }: TransfersClientProps) {
  const router = useRouter();
  const { transfers, isLoading, error, refresh } = useTransferHistory();
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterMinAmount, setFilterMinAmount] = useState("");
  const [filterMaxAmount, setFilterMaxAmount] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refresh();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refresh]);

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      { variant: "default" | "secondary" | "destructive"; label: string }
    > = {
      PENDING: { variant: "secondary", label: "En attente" },
      VALIDATED: { variant: "default", label: "Validé" },
      REJECTED: { variant: "destructive", label: "Rejeté" },
      POSTED: { variant: "default", label: "Exécuté" },
    };

    const config = variants[status] || variants.PENDING;

    return (
      <Badge
        variant={config.variant}
        className={
          status === "VALIDATED" || status === "POSTED"
            ? "bg-green-500 hover:bg-green-600"
            : ""
        }
      >
        {config.label}
      </Badge>
    );
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

  const filteredTransfers = transfers.filter((transfer) => {
    if (filterStatus !== "all" && transfer.status !== filterStatus) {
      return false;
    }

    if (filterMinAmount && transfer.amount < parseFloat(filterMinAmount)) {
      return false;
    }

    if (filterMaxAmount && transfer.amount > parseFloat(filterMaxAmount)) {
      return false;
    }

    if (filterStartDate) {
      const transferDate = new Date(transfer.accountDate);
      const startDate = new Date(filterStartDate);
      if (transferDate < startDate) return false;
    }

    if (filterEndDate) {
      const transferDate = new Date(transfer.accountDate);
      const endDate = new Date(filterEndDate);
      if (transferDate > endDate) return false;
    }

    return true;
  });

  const resetFilters = () => {
    setFilterStatus("all");
    setFilterMinAmount("");
    setFilterMaxAmount("");
    setFilterStartDate("");
    setFilterEndDate("");
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Virements</h1>
            <p className="text-muted-foreground">
              Gérez vos virements bancaires
            </p>
          </div>
        </div>
        <Card className="border-primary/20">
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <p>Erreur lors du chargement de l'historique</p>
              <p className="text-sm text-muted-foreground mt-2">
                {error.message}
              </p>
              <Button onClick={refresh} className="mt-4">
                <RefreshCw className="h-4 w-4 mr-2" />
                Réessayer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Virements</h1>
          <p className="text-muted-foreground">Gérez vos virements bancaires</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refresh} disabled={isLoading}>
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Actualiser
          </Button>
          <Button asChild>
            <Link href="/dashboard/transfers/new">
              <Plus className="mr-2 h-4 w-4" />
              Nouveau virement
            </Link>
          </Button>
        </div>
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Filtres</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="mr-2 h-4 w-4" />
              {showFilters ? "Masquer" : "Afficher"}
            </Button>
          </div>
        </CardHeader>
        {showFilters && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Statut</Label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="all">Tous</option>
                  <option value="PENDING">En attente</option>
                  <option value="VALIDATED">Validé</option>
                  <option value="POSTED">Exécuté</option>
                  <option value="REJECTED">Rejeté</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Montant minimum (€)</Label>
                <Input
                  type="number"
                  value={filterMinAmount}
                  onChange={(e) => setFilterMinAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label>Montant maximum (€)</Label>
                <Input
                  type="number"
                  value={filterMaxAmount}
                  onChange={(e) => setFilterMaxAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label>Date de début</Label>
                <Input
                  type="date"
                  value={filterStartDate}
                  onChange={(e) => setFilterStartDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Date de fin</Label>
                <Input
                  type="date"
                  value={filterEndDate}
                  onChange={(e) => setFilterEndDate(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="outline" onClick={resetFilters}>
                Réinitialiser
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle>
            Historique des virements ({filteredTransfers.length})
          </CardTitle>
          <CardDescription>
            Liste de tous vos virements effectués
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Chargement de l'historique...
              </p>
            </div>
          ) : filteredTransfers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                {transfers.length === 0
                  ? "Aucun virement trouvé"
                  : "Aucun virement ne correspond aux filtres sélectionnés"}
              </p>
              <Button asChild variant="outline">
                <Link href="/dashboard/transfers/new">Créer un virement</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTransfers.map((transfer) => (
                <div
                  key={transfer.id}
                  className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">{transfer.reason}</h3>
                        {getStatusBadge(transfer.status)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">IBAN: </span>
                          <span className="font-mono text-xs">
                            {transfer.accountIBAN}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Direction:{" "}
                          </span>
                          <span
                            className={
                              transfer.transactionDirection === "CREDIT"
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
                            {transfer.transactionDirection === "CREDIT"
                              ? "Crédit"
                              : "Débit"}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <div>
                          <span>Date: </span>
                          <span>
                            {formatDate(transfer.accountDate)} à{" "}
                            {formatTime(transfer.accountDate)}
                          </span>
                        </div>
                        {transfer.transferId && (
                          <div>
                            <span>ID Virement: </span>
                            <span className="font-mono text-xs">
                              {transfer.transferId}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <p
                        className={`text-2xl font-bold ${
                          transfer.transactionDirection === "CREDIT"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {transfer.transactionDirection === "CREDIT" ? "+" : "-"}
                        {transfer.amount.toFixed(2)} €
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
