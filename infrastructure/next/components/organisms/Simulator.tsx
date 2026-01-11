"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSimulateSchedule } from "@/hooks/useCredits";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/atoms/Card";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Label } from "@/components/atoms/Label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/atoms/Table";
import { ArrowLeft, Calculator, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function Simulator() {
  const router = useRouter();
  const { schedule, simulate, isLoading } = useSimulateSchedule();

  const [amountBorrowed, setAmountBorrowed] = useState("");
  const [annualRate, setAnnualRate] = useState("");
  const [insuranceRate, setInsuranceRate] = useState("");
  const [durationInMonths, setDurationInMonths] = useState("");

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amountBorrowed || !annualRate || !insuranceRate || !durationInMonths) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    const amount = parseFloat(amountBorrowed);
    const rate = parseFloat(annualRate);
    const insurance = parseFloat(insuranceRate);
    const duration = parseInt(durationInMonths);

    if (amount <= 0 || rate < 0 || insurance < 0 || duration <= 0) {
      toast.error("Veuillez entrer des valeurs valides");
      return;
    }

    try {
      await simulate({
        amountBorrowed: amount,
        annualRate: rate,
        insuranceRate: insurance,
        durationInMonths: duration,
      });
      toast.success("Simulation effectuée avec succès");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors de la simulation"
      );
    }
  };

  const totalInterest = schedule.reduce((sum, entry) => sum + entry.interest, 0);
  const totalInsurance = schedule.reduce((sum, entry) => sum + entry.insurance, 0);
  const totalCost = schedule.reduce((sum, entry) => sum + entry.monthlyPayment, 0);
  const monthlyPayment = schedule.length > 0 ? schedule[0].monthlyPayment : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Simulateur de crédit</h1>
          <p className="text-muted-foreground">
            Calculez vos mensualités et visualisez votre échéancier
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Paramètres du crédit</CardTitle>
            <CardDescription>
              Renseignez les informations pour simuler votre crédit
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSimulate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Montant emprunté (€)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="1"
                  placeholder="Ex: 10000"
                  value={amountBorrowed}
                  onChange={(e) => setAmountBorrowed(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="annualRate">Taux annuel (%)</Label>
                <Input
                  id="annualRate"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Ex: 3.5"
                  value={annualRate}
                  onChange={(e) => setAnnualRate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="insuranceRate">Taux d&apos;assurance (%)</Label>
                <Input
                  id="insuranceRate"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Ex: 0.36"
                  value={insuranceRate}
                  onChange={(e) => setInsuranceRate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Durée (mois)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  placeholder="Ex: 60"
                  value={durationInMonths}
                  onChange={(e) => setDurationInMonths(e.target.value)}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                <Calculator className="mr-2 h-4 w-4" />
                {isLoading ? "Simulation en cours..." : "Simuler"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {schedule.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Résultats de la simulation</CardTitle>
              <CardDescription>
                Aperçu de votre crédit
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Mensualité
                    </p>
                    <p className="text-3xl font-bold">
                      {monthlyPayment.toFixed(2)} €
                    </p>
                  </div>
                  <Calculator className="h-8 w-8 text-primary" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Coût total du crédit
                    </p>
                    <p className="text-xl font-bold">
                      {totalCost.toFixed(2)} €
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Dont intérêts
                    </p>
                    <p className="text-xl font-bold">
                      {totalInterest.toFixed(2)} €
                    </p>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Coût de l&apos;assurance
                  </p>
                  <p className="text-xl font-bold">
                    {totalInsurance.toFixed(2)} €
                  </p>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium">Coût total</p>
                  </div>
                  <p className="text-2xl font-bold">
                    {(parseFloat(amountBorrowed) + totalInterest + totalInsurance).toFixed(2)} €
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Capital + intérêts + assurance
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {schedule.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tableau d&apos;amortissement</CardTitle>
            <CardDescription>
              Détail de chaque échéance sur {schedule.length} mois
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-[600px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mois</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Mensualité</TableHead>
                    <TableHead className="text-right">Principal</TableHead>
                    <TableHead className="text-right">Intérêts</TableHead>
                    <TableHead className="text-right">Assurance</TableHead>
                    <TableHead className="text-right">Capital restant</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedule.map((entry) => (
                    <TableRow key={entry.month}>
                      <TableCell className="font-medium">
                        {entry.month}
                      </TableCell>
                      <TableCell>
                        {format(new Date(entry.dueDate), "dd/MM/yyyy", {
                          locale: fr,
                        })}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {entry.monthlyPayment.toFixed(2)} €
                      </TableCell>
                      <TableCell className="text-right">
                        {entry.principal.toFixed(2)} €
                      </TableCell>
                      <TableCell className="text-right">
                        {entry.interest.toFixed(2)} €
                      </TableCell>
                      <TableCell className="text-right">
                        {entry.insurance.toFixed(2)} €
                      </TableCell>
                      <TableCell className="text-right">
                        {entry.remainingCapital.toFixed(2)} €
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
