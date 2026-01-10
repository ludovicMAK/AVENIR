"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"

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

export default function ConfirmRegistrationPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
    const [message, setMessage] = useState<string>("")

    useEffect(() => {
        const token = searchParams.get("token")

        if (!token) {
            setStatus("error")
            setMessage("Invalid confirmation link. Token is missing.")
            return
        }

        async function confirmRegistration(confirmationToken: string) {
            try {
                await authApi.confirmRegistration(confirmationToken)
                setStatus("success")
                setMessage("Your registration has been confirmed successfully!")
            } catch (error) {
                setStatus("error")
                if (error instanceof ApiError) {
                    setMessage(error.message)
                } else if (error instanceof Error) {
                    setMessage(error.message)
                } else {
                    setMessage("An unexpected error occurred. Please try again.")
                }
            }
        }

        confirmRegistration(token)
    }, [searchParams])

    const handleGoToLogin = () => {
        router.push("/login")
    }

    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                {status === "loading" && "Confirming Registration..."}
                                {status === "success" && "Registration Confirmed!"}
                                {status === "error" && "Confirmation Failed"}
                            </CardTitle>
                            <CardDescription>
                                {status === "loading" && "Please wait while we confirm your registration."}
                                {status === "success" && "You can now log in to your account."}
                                {status === "error" && "There was a problem confirming your registration."}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center">
                                {status === "loading" && (
                                    <div className="flex justify-center items-center py-8">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                                    </div>
                                )}
                                {status === "success" && (
                                    <div className="space-y-4">
                                        <p className="text-sm">{message}</p>
                                        <Button onClick={handleGoToLogin} className="w-full">
                                            Go to Login
                                        </Button>
                                    </div>
                                )}
                                {status === "error" && (
                                    <div className="space-y-4">
                                        <p className="text-sm text-destructive">{message}</p>
                                        <Button onClick={handleGoToLogin} className="w-full">
                                            Back to Login
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
