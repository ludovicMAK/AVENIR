"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { authApi } from "@/api/auth";
import { ApiError } from "@/lib/errors";
import { Button } from "@/components/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/Card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/Field";
import { Input } from "@/components/Input";
import { RegisterPayload } from "@/types/auth";
import { ArrowRight, CheckCircle2 } from "lucide-react";

type FieldErrors = {
  firstname?: string[];
  lastname?: string[];
  email?: string[];
  password?: string[];
};

export default function Page() {
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const extractFieldErrors = (message: string): FieldErrors => {
    const result: FieldErrors = {};
    const parts = message.split(",");

    parts.forEach((part) => {
      const text = part.trim();
      if (!text) return;
      const lower = text.toLowerCase();

      if (lower.includes("first")) {
        result.firstname = [...(result.firstname ?? []), text];
      } else if (lower.includes("last")) {
        result.lastname = [...(result.lastname ?? []), text];
      } else if (lower.includes("email")) {
        result.email = [...(result.email ?? []), text];
      } else if (lower.includes("pass")) {
        result.password = [...(result.password ?? []), text];
      } else {
        result.password = [...(result.password ?? []), text];
      }
    });

    if (!Object.keys(result).length) {
      result.password = [message];
    }

    return result;
  };

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const data: RegisterPayload = {
      firstname: formData.get("firstname") as string,
      lastname: formData.get("lastname") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

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

      setFieldErrors(extractFieldErrors(message));
    } finally {
      setIsLoading(false);
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
              <p className="text-sm text-muted-foreground">
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
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-primary transition-colors text-center"
          >
            ← Retour à l'accueil
          </Link>
          <Card className="border-primary/20">
            <CardHeader className="text-center">
              <CardTitle>Créer un compte</CardTitle>
              <CardDescription>
                Rejoignez AVENIR et gérez vos finances
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="firstname">Prénom</FieldLabel>
                    <Input
                      id="firstname"
                      name="firstname"
                      type="text"
                      required
                      className="border-primary/20"
                    />
                    {fieldErrors.firstname && (
                      <FieldError
                        errors={fieldErrors.firstname.map((message) => ({
                          message,
                        }))}
                      />
                    )}
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="lastname">Nom</FieldLabel>
                    <Input
                      id="lastname"
                      name="lastname"
                      type="text"
                      required
                      className="border-primary/20"
                    />
                    {fieldErrors.lastname && (
                      <FieldError
                        errors={fieldErrors.lastname.map((message) => ({
                          message,
                        }))}
                      />
                    )}
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="border-primary/20"
                    />
                    {fieldErrors.email && (
                      <FieldError
                        errors={fieldErrors.email.map((message) => ({
                          message,
                        }))}
                      />
                    )}
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      className="border-primary/20"
                    />
                    {fieldErrors.password && (
                      <FieldError
                        errors={fieldErrors.password.map((message) => ({
                          message,
                        }))}
                      />
                    )}
                  </Field>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    {isLoading ? "Création..." : "Créer mon compte"}
                  </Button>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>
          <div className="text-center text-sm text-muted-foreground">
            Déjà un compte?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
