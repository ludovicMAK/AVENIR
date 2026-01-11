"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { authApi } from "@/api/auth";
import {
  clearRedirectHint,
  getRedirectHint,
  persistAuthentication,
} from "@/lib/auth/client";
import { sanitizeRedirectPath } from "@/lib/auth/redirect";
import { ApiError } from "@/lib/errors";
import { setCurrentUserId } from "@/api/client";
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
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslations } from "@/lib/i18n/simple-i18n";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "L'email est requis" })
    .email({ message: "Email invalide" }),
  password: z
    .string()
    .min(1, { message: "Le mot de passe est requis" })
    .min(6, { message: "Le mot de passe doit contenir au moins 6 caractères" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Page() {
  const [apiError, setApiError] = useState<string>("");
  const router = useRouter();
  const tAuth = useTranslations('auth');
  const tCommon = useTranslations('common');

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormValues) {
    setApiError("");

    try {
      const response = await authApi.login(data);
      const sessionToken = response?.token;
      const userId = response?.user?.id;

      if (!sessionToken || !userId) {
        throw new ApiError(
          "INFRASTRUCTURE_ERROR",
          "Invalid authentication response."
        );
      }

      persistAuthentication(sessionToken);
      setCurrentUserId(userId);

      const redirectPath = sanitizeRedirectPath(getRedirectHint());
      clearRedirectHint();
      router.replace(redirectPath);
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

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-background to-primary/10">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-primary transition-colors text-center"
          >
            ← {tCommon('back')} {tCommon('home')}
          </Link>
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>{tAuth('login')}</CardTitle>
              <CardDescription>
                Connectez-vous à votre compte {tCommon('appName')}
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
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{tAuth('email')}</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="email@exemple.com"
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
                    className="w-full"
                  >
                    {form.formState.isSubmitting ? tCommon('loading') : tAuth('login')}
                  </Button>
                  
                  <p className="text-center text-sm text-muted-foreground">
                    {tAuth('noAccount')}{" "}
                    <Link href="/register" className="text-primary hover:underline">
                      {tAuth('register')}
                    </Link>
                  </p>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
