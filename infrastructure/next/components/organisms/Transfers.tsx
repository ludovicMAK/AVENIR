"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/atoms/Card";
import { Button } from "@/components/atoms/Button";
import { Badge } from "@/components/atoms/Badge";
import { Input } from "@/components/atoms/Input";
import { Label } from "@/components/atoms/Label";
import { Plus, Filter, ArrowUpDown, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useTransferHistory } from "@/hooks/useTransfers";
import { useTranslations, useI18n } from "@/lib/i18n/simple-i18n";

interface TransfersClientProps {
  userId: string;
}

export default function Transfers({ userId }: TransfersClientProps) {
  const router = useRouter();
  const { transfers, isLoading, error, refresh } = useTransferHistory();
  const t = useTranslations("transfers");
  const { locale } = useI18n();

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
      PENDING: { variant: "secondary", label: t("pending") },
      VALIDATED: { variant: "default", label: t("validated") },
      REJECTED: { variant: "destructive", label: t("rejected") },
      POSTED: { variant: "default", label: t("posted") },
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
    return date.toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(locale === "fr" ? "fr-FR" : "en-US", {
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
      const transferDate = new Date(transfer.dateRequested);
      const startDate = new Date(filterStartDate);
      if (transferDate < startDate) return false;
    }

    if (filterEndDate) {
      const transferDate = new Date(transfer.dateRequested);
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
            <h1 className="text-3xl font-bold">{t("title")}</h1>
            <p className="text-muted-foreground">{t("subtitle")}</p>
          </div>
        </div>
        <Card className="border-primary/20">
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <p>{t("error")}</p>
              <p className="text-sm text-muted-foreground mt-2">
                {error.message}
              </p>
              <Button onClick={refresh} className="mt-4">
                <RefreshCw className="h-4 w-4 mr-2" />
                {t("retry")}
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
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refresh} disabled={isLoading}>
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            {t("refresh")}
          </Button>
          <Button asChild>
            <Link href="/dashboard/transfers/new">
              <Plus className="mr-2 h-4 w-4" />
              {t("newTransfer")}
            </Link>
          </Button>
        </div>
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{t("filters")}</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="mr-2 h-4 w-4" />
              {showFilters ? t("hide") : t("show")}
            </Button>
          </div>
        </CardHeader>
        {showFilters && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{t("status")}</Label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="all">{t("all")}</option>
                  <option value="PENDING">{t("pending")}</option>
                  <option value="VALIDATED">{t("validated")}</option>
                  <option value="POSTED">{t("posted")}</option>
                  <option value="REJECTED">{t("rejected")}</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>{t("minAmount")}</Label>
                <Input
                  type="number"
                  value={filterMinAmount}
                  onChange={(e) => setFilterMinAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label>{t("maxAmount")}</Label>
                <Input
                  type="number"
                  value={filterMaxAmount}
                  onChange={(e) => setFilterMaxAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label>{t("startDate")}</Label>
                <Input
                  type="date"
                  value={filterStartDate}
                  onChange={(e) => setFilterStartDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>{t("endDate")}</Label>
                <Input
                  type="date"
                  value={filterEndDate}
                  onChange={(e) => setFilterEndDate(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="outline" onClick={resetFilters}>
                {t("reset")}
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle>
            {t("history")} ({filteredTransfers.length})
          </CardTitle>
          <CardDescription>{t("transferList")}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t("loading")}</p>
            </div>
          ) : filteredTransfers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                {transfers.length === 0
                  ? t("noTransfers")
                  : t("noTransfersFilter")}
              </p>
              <Button asChild variant="outline">
                <Link href="/dashboard/transfers/new">
                  {t("createTransfer")}
                </Link>
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
                        <h3 className="font-semibold">
                          {transfer.description}
                        </h3>
                        {getStatusBadge(transfer.status)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">
                            {t("amount")}:{" "}
                          </span>
                          <span className="font-semibold text-lg">
                            {transfer.amount.toFixed(2)} €
                          </span>
                        </div>
                        {transfer.dateExecuted && (
                          <div>
                            <span className="text-muted-foreground">
                              {t("dateExecuted")}:{" "}
                            </span>
                            <span>{formatDate(transfer.dateExecuted)}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <div>
                          <span>{t("dateRequested")}: </span>
                          <span>
                            {formatDate(transfer.dateRequested)}{" "}
                            {locale === "fr" ? "à" : "at"}{" "}
                            {formatTime(transfer.dateRequested)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
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
