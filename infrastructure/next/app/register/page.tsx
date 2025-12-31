"use client"

import { FormEvent, useState } from "react"
import { authApi } from "@/api/auth"
import { ApiError } from "@/lib/errors"
import { Button } from "@/components/Button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/Card"
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/Field"
import { Input } from "@/components/Input"
import { RegisterPayload } from "@/types/auth"

type FieldErrors = {
    firstname?: string[]
    lastname?: string[]
    email?: string[]
    password?: string[]
}

export default function Page() {
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
    const [isLoading, setIsLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    const extractFieldErrors = (message: string): FieldErrors => {
        const result: FieldErrors = {}
        const parts = message.split(",")

        parts.forEach((part) => {
            const text = part.trim()
            if (!text) return
            const lower = text.toLowerCase()

            if (lower.includes("first")) {
                result.firstname = [...(result.firstname ?? []), text]
            } else if (lower.includes("last")) {
                result.lastname = [...(result.lastname ?? []), text]
            } else if (lower.includes("email")) {
                result.email = [...(result.email ?? []), text]
            } else if (lower.includes("pass")) {
                result.password = [...(result.password ?? []), text]
            } else {
                result.password = [...(result.password ?? []), text]
            }
        })

        if (!Object.keys(result).length) {
            result.password = [message]
        }

        return result
    }

    async function handleRegister(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setFieldErrors({})
        setIsLoading(true)

        const formData = new FormData(event.currentTarget)
        const data: RegisterPayload = {
            firstname: formData.get("firstname") as string,
            lastname: formData.get("lastname") as string,
            email: formData.get("email") as string,
            password: formData.get("password") as string,
        }

        try {
            await authApi.register(data)
            setSuccess(true)
        } catch (error) {
            const message =
                error instanceof ApiError
                    ? error.message
                    : error instanceof Error
                        ? error.message
                        : "An unexpected error occurred"

            setFieldErrors(extractFieldErrors(message))
        } finally {
            setIsLoading(false)
        }
    }

    if (success) {
        return (
            <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Check your email</CardTitle>
                            <CardDescription>
                                We've sent you a confirmation link. Please check your email to
                                complete your registration.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground mb-4">
                                    The confirmation link will expire in 24 hours.
                                </p>
                                <FieldDescription className="text-center">
                                    <a href="/login">Back to login</a>
                                </FieldDescription>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
            <div className="flex flex-col gap-6">
                <Card>
                    <CardHeader>
                            <CardTitle>Create a new account</CardTitle>
                            <CardDescription>Enter your details to register</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleRegister}>
                                <FieldGroup>
                                    <Field>
                                        <FieldLabel htmlFor="firstname">Firstname</FieldLabel>
                                        <Input id="firstname" name="firstname" type="text" required />
                                        {fieldErrors.firstname && (
                                            <FieldError
                                                errors={fieldErrors.firstname.map((message) => ({ message }))}
                                            />
                                        )}
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="lastname">Lastname</FieldLabel>
                                        <Input id="lastname" name="lastname" type="text" required />
                                        {fieldErrors.lastname && (
                                            <FieldError
                                                errors={fieldErrors.lastname.map((message) => ({ message }))}
                                            />
                                        )}
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="email">Email</FieldLabel>
                                        <Input id="email" name="email" type="email" required />
                                        {fieldErrors.email && (
                                            <FieldError
                                                errors={fieldErrors.email.map((message) => ({ message }))}
                                            />
                                        )}
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="password">Password</FieldLabel>
                                        <Input id="password" name="password" type="password" required />
                                        {fieldErrors.password && (
                                            <FieldError
                                                errors={fieldErrors.password.map((message) => ({ message }))}
                                            />
                                        )}
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
            </div>
        </div>
    )
}
