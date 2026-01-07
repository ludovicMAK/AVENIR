"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { accountsApi } from "@/api/account";
import { ApiError } from "@/lib/errors";
import { Button } from "@/components/ui/button";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Plus, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { AccountTypeValue } from "@/types/accounts";

// Schéma de validation Zod
const createAccountSchema = z
  .object({
    accountName: z
      .string()
      .min(3, { message: "Le nom doit contenir au moins 3 caractères" })
      .max(50, { message: "Le nom ne peut pas dépasser 50 caractères" }),
    accountType: z
      .enum(["current", "savings", "trading"])
      .refine((val) => val, {
        message: "Veuillez sélectionner un type de compte",
      }),
    authorizedOverdraft: z.boolean().optional(),
    overdraftLimit: z.number().min(0).optional(),
    overdraftFees: z.number().min(0).max(100).optional(),
  })
  .refine(
    (data) => {
      // Si c'est un compte courant avec découvert autorisé, vérifier les limites
      if (data.accountType === "current" && data.authorizedOverdraft) {
        return data.overdraftLimit !== undefined && data.overdraftLimit > 0;
      }
      return true;
    },
    {
      message: "Le montant du découvert autorisé est requis",
      path: ["overdraftLimit"],
    }
  );

type CreateAccountFormValues = z.infer<typeof createAccountSchema>;

interface CreateAccountClientProps {
  userId: string;
}

export default function CreateAccountClient({
  userId,
}: CreateAccountClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdAccountId, setCreatedAccountId] = useState<string | null>(null);

  const form = useForm<CreateAccountFormValues>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: {
      accountName: "",
      accountType: undefined,
      authorizedOverdraft: false,
      overdraftLimit: 0,
      overdraftFees: 5,
    },
  });

  const accountType = form.watch("accountType");
  const authorizedOverdraft = form.watch("authorizedOverdraft");

  async function onSubmit(values: CreateAccountFormValues) {
    setIsSubmitting(true);

    try {
      const data: {
        idOwner: string;
        accountType: AccountTypeValue;
        accountName: string;
        authorizedOverdraft?: boolean;
        overdraftLimit?: number;
        overdraftFees?: number;
      } = {
        idOwner: userId,
        accountType: values.accountType,
        accountName: values.accountName,
      };

      // Ajouter les données de découvert seulement si applicable
      if (values.accountType === "current" && values.authorizedOverdraft) {
        data.authorizedOverdraft = true;
        data.overdraftLimit = values.overdraftLimit;
        data.overdraftFees = values.overdraftFees;
      }

      const account = await accountsApi.create(data);
      setCreatedAccountId(account.id);
      setSuccess(true);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Une erreur est survenue lors de la création du compte";

      form.setError("root", { message });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (success && createdAccountId) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <Card className="border-primary/20">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-success rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">
              Compte créé avec succès !
            </CardTitle>
            <CardDescription className="text-base">
              Votre nouveau compte est maintenant actif et prêt à être utilisé.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                className="flex-1 bg-primary hover:bg-primary/90"
                onClick={() =>
                  router.push(`/dashboard/accounts/${createdAccountId}`)
                }
              >
                Voir le compte
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => router.push("/dashboard/accounts")}
              >
                Retour aux comptes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <div className="mb-6">
        <Link
          href="/dashboard/accounts"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux comptes
        </Link>
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-2xl">Créer un nouveau compte</CardTitle>
          <CardDescription>
            Remplissez le formulaire pour créer un nouveau compte bancaire
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="accountName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom du compte</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Compte Courant Principal"
                        className="border-primary/20"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Choisissez un nom pour identifier facilement ce compte
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="accountType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type de compte</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="border-primary/20">
                          <SelectValue placeholder="Sélectionnez un type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="current">Compte Courant</SelectItem>
                        <SelectItem value="savings">Compte Épargne</SelectItem>
                        <SelectItem value="trading">Compte Titres</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Le type de compte détermine ses fonctionnalités
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Options de découvert (seulement pour compte courant) */}
              {accountType === "current" && (
                <div className="space-y-4 p-4 border border-primary/20 rounded-lg bg-primary/5">
                  <h3 className="font-medium">Options de découvert</h3>

                  <FormField
                    control={form.control}
                    name="authorizedOverdraft"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 border-primary/20">
                        <div className="space-y-0.5">
                          <FormLabel>Découvert autorisé</FormLabel>
                          <FormDescription>
                            Autoriser un découvert sur ce compte
                          </FormDescription>
                        </div>
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="h-4 w-4 rounded border-primary/20 text-primary focus:ring-primary"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {authorizedOverdraft && (
                    <>
                      <FormField
                        control={form.control}
                        name="overdraftLimit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Montant du découvert autorisé (€)
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                step="100"
                                placeholder="500"
                                className="border-primary/20"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                              />
                            </FormControl>
                            <FormDescription>
                              Montant maximum du découvert autorisé
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="overdraftFees"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Frais de découvert (%)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                step="0.5"
                                placeholder="5"
                                className="border-primary/20"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                              />
                            </FormControl>
                            <FormDescription>
                              Pourcentage de frais appliqués au découvert
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </div>
              )}

              {form.formState.errors.root && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
                  {form.formState.errors.root.message}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  {isSubmitting ? (
                    "Création..."
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Créer le compte
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dashboard/accounts")}
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
