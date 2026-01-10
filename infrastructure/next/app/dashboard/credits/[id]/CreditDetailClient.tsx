"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreditStatus, usePaymentHistory, usePayInstallment } from "@/hooks/useCredits";
import { useAccounts } from "@/hooks/useAccounts";
import { DueDate } from "@/api/credits";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  AlertCircle,
  DollarSign,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface CreditDetailClientProps {
  creditId: string;
}

export default function CreditDetailClient({
  creditId,
}: CreditDetailClientProps) {
  const router = useRouter();
  const { credit, isLoading: creditLoading, refresh: refreshCredit } = useCreditStatus(creditId);
  const { dueDates, isLoading: dueDatesLoading, refresh: refreshDueDates } = usePaymentHistory(creditId);
  const { accounts } = useAccounts();
  const { payInstallment, isLoading: paying } = usePayInstallment();

  const [paymentDialog, setPaymentDialog] = useState(false);
  const [selectedDueDate, setSelectedDueDate] = useState<DueDate | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState("");

  const handlePayment = async () => {
    if (!selectedDueDate || !selectedAccountId) {
      toast.error("Veuillez sélectionner un compte");
      return;
    }

    try {
      await payInstallment({
        dueDateId: selectedDueDate.id,
        accountId: selectedAccountId,
      });
      toast.success("Échéance payée avec succès !");
      setPaymentDialog(false);
      setSelectedDueDate(null);
      setSelectedAccountId("");
      refreshCredit();
      refreshDueDates();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors du paiement de l'échéance"
      );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            À payer
          </Badge>
        );
      case "paid":
        return (
          <Badge variant="default" className="gap-1 bg-green-600">
            <CheckCircle className="h-3 w-3" />
            Payée
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

  if (creditLoading || dueDatesLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!credit) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        <Card className="border-destructive/50">
          <CardContent className="p-12 text-center">
            <p className="text-destructive">Crédit introuvable</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progressPercentage = (credit.totalPaid / credit.totalAmountDue) * 100;
  const sortedDueDates = [...dueDates].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Crédit #{creditId.slice(0, 8)}</h1>
          <p className="text-muted-foreground">
            Accordé le{" "}
            {format(new Date(credit.dateGranted), "dd MMMM yyyy", {
              locale: fr,
            })}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Montant emprunté</CardDescription>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {credit.amountBorrowed.toFixed(2)} €
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Mensualité</CardDescription>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {credit.monthlyPayment.toFixed(2)} €
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
            <div className="text-2xl font-bold">
              {credit.totalPaid.toFixed(2)} €
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
              {credit.remainingAmount.toFixed(2)} €
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Progression du remboursement</CardTitle>
          <CardDescription>
            {progressPercentage.toFixed(1)}% remboursé
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-4 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span>0 €</span>
            <span>{credit.totalAmountDue.toFixed(2)} €</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informations du crédit</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Taux annuel</p>
              <p className="font-medium">{credit.annualRate.toFixed(2)}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Taux assurance</p>
              <p className="font-medium">{credit.insuranceRate.toFixed(2)}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Durée</p>
              <p className="font-medium">{credit.durationInMonths} mois</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Statut</p>
              <p className="font-medium capitalize">{credit.status}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Échéancier de remboursement</CardTitle>
          <CardDescription>
            {dueDates.length} échéances ({dueDates.filter((d) => d.status === "paid").length} payées)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date d&apos;échéance</TableHead>
                <TableHead className="text-right">Montant dû</TableHead>
                <TableHead className="text-right">Principal</TableHead>
                <TableHead className="text-right">Intérêts</TableHead>
                <TableHead className="text-right">Assurance</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedDueDates.map((dueDate) => (
                <TableRow key={dueDate.id}>
                  <TableCell>
                    {format(new Date(dueDate.dueDate), "dd/MM/yyyy", {
                      locale: fr,
                    })}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {dueDate.amountDue.toFixed(2)} €
                  </TableCell>
                  <TableCell className="text-right">
                    {dueDate.principal.toFixed(2)} €
                  </TableCell>
                  <TableCell className="text-right">
                    {dueDate.interest.toFixed(2)} €
                  </TableCell>
                  <TableCell className="text-right">
                    {dueDate.insurance.toFixed(2)} €
                  </TableCell>
                  <TableCell>{getStatusBadge(dueDate.status)}</TableCell>
                  <TableCell className="text-right">
                    {(dueDate.status === "pending" ||
                      dueDate.status === "overdue") && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedDueDate(dueDate);
                          setPaymentDialog(true);
                        }}
                      >
                        Payer
                      </Button>
                    )}
                    {dueDate.status === "paid" && dueDate.paidDate && (
                      <span className="text-sm text-muted-foreground">
                        Payée le{" "}
                        {format(new Date(dueDate.paidDate), "dd/MM/yyyy", {
                          locale: fr,
                        })}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={paymentDialog} onOpenChange={setPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payer l&apos;échéance</DialogTitle>
            <DialogDescription>
              Sélectionnez le compte depuis lequel effectuer le paiement
            </DialogDescription>
          </DialogHeader>

          {selectedDueDate && (
            <div className="space-y-4">
              <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Date d&apos;échéance</span>
                  <span>
                    {format(new Date(selectedDueDate.dueDate), "dd/MM/yyyy", {
                      locale: fr,
                    })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Principal</span>
                  <span>{selectedDueDate.principal.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Intérêts</span>
                  <span>{selectedDueDate.interest.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Assurance</span>
                  <span>{selectedDueDate.insurance.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between font-medium pt-2 border-t">
                  <span>Total</span>
                  <span>{selectedDueDate.amountDue.toFixed(2)} €</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="account">Compte de prélèvement</Label>
                <Select
                  value={selectedAccountId}
                  onValueChange={setSelectedAccountId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un compte" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.accountName || account.accountType} - {account.IBAN}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPaymentDialog(false)}
              disabled={paying}
            >
              Annuler
            </Button>
            <Button onClick={handlePayment} disabled={paying || !selectedAccountId}>
              {paying ? "Paiement en cours..." : "Confirmer le paiement"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
