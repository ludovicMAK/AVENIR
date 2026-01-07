"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/api/auth";
import {
  clearRedirectHint,
  getRedirectHint,
  persistAuthentication,
} from "@/lib/auth/client";
import { sanitizeRedirectPath } from "@/lib/auth/redirect";
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
import { LoginPayload } from "@/types/auth";

type FieldErrors = {
  email?: string[];
  password?: string[];
};

export default function Page() {
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const extractFieldErrors = (message: string): FieldErrors => {
    const result: FieldErrors = {};
    const parts = message.split(",");

    parts.forEach((part) => {
      const text = part.trim();
      if (!text) return;
      const lower = text.toLowerCase();

      if (lower.includes("email")) {
        result.email = [...(result.email ?? []), text];
      } else if (lower.includes("pass")) {
        result.password = [...(result.password ?? []), text];
      } else {
        result.password = [...(result.password ?? []), text];
      }
    });

    if (!result.email && message.toLowerCase().includes("email")) {
      result.email = [message];
    }
    if (!result.password && message.toLowerCase().includes("pass")) {
      result.password = [message];
    }
    if (!result.email && !result.password) {
      result.password = [message];
    }

    return result;
  };

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const data: LoginPayload = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    try {
      const response = await authApi.login(data);
      const userToken = response?.user?.id;

      if (!userToken) {
        throw new ApiError(
          "INFRASTRUCTURE_ERROR",
          "Invalid authentication response."
        );
      }

      persistAuthentication(userToken);

      const redirectPath = sanitizeRedirectPath(getRedirectHint());
      clearRedirectHint();
      router.replace(redirectPath);
      router.refresh();
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

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Login to your account</CardTitle>
              <CardDescription>
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input id="email" name="email" type="email" required />
                    {fieldErrors.email && (
                      <FieldError
                        errors={fieldErrors.email.map((message) => ({
                          message,
                        }))}
                      />
                    )}
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                    />
                    {fieldErrors.password && (
                      <FieldError
                        errors={fieldErrors.password.map((message) => ({
                          message,
                        }))}
                      />
                    )}
                  </Field>
                  <Field>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Logging in..." : "Login"}
                    </Button>
                    <FieldDescription className="text-center">
                      Don’t have an account? <a href="/register">Sign up</a>
                    </FieldDescription>
                  </Field>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
