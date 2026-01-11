"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/atoms/AlertDialog";
import { Loader2, AlertTriangle } from "lucide-react";
import { accountsApi } from "@/api/account";
import { toast } from "sonner";
import { Account } from "@/types/accounts";

interface CloseAccountDialogProps {
  account: Account;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CloseAccountDialog({
  account,
  open,
  onOpenChange,
  onSuccess,
}: CloseAccountDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = async () => {
    if (account.balance !== 0) {
      toast.error("Impossible de fermer un compte avec un solde non nul", {
        description: `Solde actuel : ${(account.balance / 100).toFixed(2)} €`,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await accountsApi.close(account.id);
      toast.success("Compte fermé avec succès");
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Impossible de fermer le compte";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canClose = account.balance === 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Fermer le compte
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>
              Êtes-vous sûr de vouloir fermer le compte{" "}
              <strong>{account.accountName}</strong> ?
            </p>
            {!canClose && (
              <div className="rounded-md bg-destructive/10 p-3 text-destructive">
                <p className="font-semibold">⚠️ Fermeture impossible</p>
                <p className="text-sm mt-1">
                  Le solde du compte doit être à 0,00 €. Solde actuel :{" "}
                  {(account.balance / 100).toFixed(2)} €
                </p>
              </div>
            )}
            {canClose && (
              <div className="rounded-md bg-yellow-50 dark:bg-yellow-950 p-3 text-yellow-900 dark:text-yellow-100">
                <p className="font-semibold">⚠️ Action irréversible</p>
                <p className="text-sm mt-1">
                  Une fois fermé, ce compte ne pourra plus être utilisé. Toutes
                  les transactions en attente doivent être finalisées avant la
                  fermeture.
                </p>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            disabled={isSubmitting || !canClose}
            className="bg-destructive hover:bg-destructive/90"
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              handleClose();
            }}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Fermer définitivement
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
