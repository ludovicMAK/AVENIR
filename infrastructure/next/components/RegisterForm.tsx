"use client";
import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
    Field, FieldDescription, FieldError, FieldGroup, FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authApi } from "@/api/auth";
import { RegisterPayload } from "@/types/auth";

export function RegisterForm() {
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    async function handleRegister(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
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
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Create a new account</CardTitle>
                    <CardDescription>Enter your details to register</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleRegister}>
                        <FieldGroup>
                            {error && <FieldError errors={[{ message: error }]} />}
                            <Field>
                                <FieldLabel htmlFor="firstname">Firstname</FieldLabel>
                                <Input id="firstname" name="firstname" type="text" required />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="lastname">Lastname</FieldLabel>
                                <Input id="lastname" name="lastname" type="text" required />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="email">Email</FieldLabel>
                                <Input id="email" name="email" type="email" required />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="password">Password</FieldLabel>
                                <Input id="password" name="password" type="password" required />
                            </Field>
                            <Field>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? "Registering..." : "Register"}
                                </Button>
                                <FieldDescription className="text-center">
                                    Have an account? <a href="/login">Sign in</a>
                                </FieldDescription>
                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
