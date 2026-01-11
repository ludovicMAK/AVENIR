"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { accountsApi } from "@/api/account";
import { toast } from "sonner";

const renameSchema = z.object({
  accountName: z
    .string()
    .min(3, "Le nom doit contenir au moins 3 caractères")
    .max(50, "Le nom ne peut pas dépasser 50 caractères")
    .regex(
      /^[a-zA-Z0-9\s\-_'àâäéèêëïîôùûüÿçÀÂÄÉÈÊËÏÎÔÙÛÜŸÇ]+$/,
      "Le nom contient des caractères non autorisés"
    ),
});

type RenameFormValues = z.infer<typeof renameSchema>;

interface RenameAccountDialogProps {
  accountId: string;
  currentName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function RenameAccountDialog({
  accountId,
  currentName,
  open,
  onOpenChange,
  onSuccess,
}: RenameAccountDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RenameFormValues>({
    resolver: zodResolver(renameSchema),
    defaultValues: {
      accountName: currentName,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({ accountName: currentName });
    }
  }, [open, currentName, form]);

  const onSubmit = async (values: RenameFormValues) => {
    if (values.accountName === currentName) {
      toast.info("Le nom n'a pas été modifié");
      onOpenChange(false);
      return;
    }

    setIsSubmitting(true);

    try {
      await accountsApi.updateName(accountId, values.accountName);
      toast.success("Compte renommé avec succès");
      onOpenChange(false);
      form.reset();
      onSuccess();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Impossible de renommer le compte";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Renommer le compte</DialogTitle>
          <DialogDescription>
            Modifiez le nom de votre compte. Le changement sera immédiat.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="accountName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nouveau nom</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Mon compte principal"
                      {...field}
                      disabled={isSubmitting}
                      autoFocus
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Renommer
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
