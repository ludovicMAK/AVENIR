"use client"
import { useState, FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
import {
    Field, FieldDescription, FieldError, FieldGroup, FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { authApi } from "@/api/auth"
import { LoginPayload } from "@/types/auth"
import { clearRedirectHint, getRedirectHint, persistAuthentication } from "@/lib/auth/client"
import { sanitizeRedirectPath } from "@/lib/auth/redirect"
import { ApiError } from "@/lib/errors"

export function LoginForm() {
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    async function handleLogin(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setError(null)
        setIsLoading(true)

        const formData = new FormData(event.currentTarget)
        const data: LoginPayload = {
            email: formData.get("email") as string,
            password: formData.get("password") as string,
        }

        try {
            const response = await authApi.login(data)
            const userToken = response?.data?.user?.id

            if (!userToken) {
                throw new ApiError("INFRASTRUCTURE_ERROR", "Invalid authentication response.")
            }

            persistAuthentication(userToken)

            const redirectPath = sanitizeRedirectPath(getRedirectHint())
            clearRedirectHint()
            router.replace(redirectPath)
            router.refresh()
        } catch (error) {
            if (error instanceof ApiError) {
                setError(error.message)
            } else if (error instanceof Error) {
                setError(error.message)
            } else {
                setError("An unexpected error occurred")
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Login to your account</CardTitle>
                    <CardDescription>Enter your credentials to access your account</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin}>
                        <FieldGroup>
                            {error && <FieldError errors={[{ message: error }]} />}
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
    )
}