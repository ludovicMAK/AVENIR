"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { authApi } from "@/api/auth";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslations } from "@/lib/i18n/simple-i18n";

const registerSchema = z.object({
  firstname: z
    .string()
    .min(2, { message: "Le prénom doit contenir au moins 2 caractères" })
    .max(50, { message: "Le prénom ne peut pas dépasser 50 caractères" }),
  lastname: z
    .string()
    .min(2, { message: "Le nom doit contenir au moins 2 caractères" })
    .max(50, { message: "Le nom ne peut pas dépasser 50 caractères" }),
  email: z
    .string()
    .min(1, { message: "L'email est requis" })
    .email({ message: "Email invalide" }),
  password: z
    .string()
    .min(8, { message: "Le mot de passe doit contenir au moins 8 caractères" })
    .regex(/[A-Z]/, { message: "Le mot de passe doit contenir au moins une majuscule" })
    .regex(/[a-z]/, { message: "Le mot de passe doit contenir au moins une minuscule" })
    .regex(/[0-9]/, { message: "Le mot de passe doit contenir au moins un chiffre" }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Page() {
  const [apiError, setApiError] = useState<string>("");
  const [success, setSuccess] = useState(false);
  const tAuth = useTranslations('auth');
  const tCommon = useTranslations('common');

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstname: "",
      lastname: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: RegisterFormValues) {
    setApiError("");

    try {
      await authApi.register(data);
      setSuccess(true);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
          ? error.message
          : "An unexpected error occurred";

      setApiError(message);
    }
  }

  if (success) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-background to-primary/10">
        <div className="w-full max-w-md">
          <Card className="border-primary/20">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-success rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold">
                Vérifiez votre email
              </CardTitle>
              <CardDescription className="text-base">
                Nous vous avons envoyé un lien de confirmation. Veuillez
                consulter votre email pour compléter votre inscription.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-sm">
                Le lien de confirmation expirera dans 24 heures.
              </p>
              <Link href="/login">
                <Button className="w-full bg-primary hover:bg-primary/90">
                  Retour à la connexion
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-background to-primary/10">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-primary transition-colors text-center"
          >
            ← {tCommon('back')} {tCommon('home')}
          </Link>
          <Card className="border-primary/20">
            <CardHeader className="text-center">
              <CardTitle>{tAuth('register')}</CardTitle>
              <CardDescription>
                {tAuth('joinUs')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {apiError && (
                    <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-md">
                      {apiError}
                    </div>
                  )}
                  
                  <FormField
                    control={form.control}
                    name="firstname"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{tAuth('firstname')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Jean"
                            className="border-primary/20"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="lastname"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{tAuth('lastname')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Dupont"
                            className="border-primary/20"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{tAuth('email')}</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="jean.dupont@exemple.com"
                            className="border-primary/20"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{tAuth('password')}</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            className="border-primary/20"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    disabled={form.formState.isSubmitting}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    {form.formState.isSubmitting ? tCommon('loading') : tAuth('createAccount')}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
          <div className="text-center text-sm text-muted-foreground">
            {tAuth('alreadyAccount')}{" "}
            <Link href="/login" className="text-primary hover:underline">
              {tAuth('login')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
