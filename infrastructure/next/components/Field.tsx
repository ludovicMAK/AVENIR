"use client"

import * as React from "react"
import { Label } from "@/components/Label"

export const FieldGroup = ({ className, ...props }: React.ComponentProps<"div">) => (
    <div
        data-slot="field-group"
        className={`flex w-full flex-col gap-6${className ? ` ${className}` : ""}`}
        {...props}
    />
)

export const Field = ({ className, ...props }: React.ComponentProps<"div">) => (
    <div
        role="group"
        data-slot="field"
        className={`flex w-full flex-col gap-2 data-[invalid=true]:text-destructive${className ? ` ${className}` : ""}`}
        {...props}
    />
)

export const FieldLabel = ({
    className,
    ...props
}: React.ComponentProps<typeof Label>) => (
    <Label
        data-slot="field-label"
        className={`flex w-fit items-center gap-2 text-sm leading-snug font-medium group-data-[disabled=true]/field:opacity-50${className ? ` ${className}` : ""}`}
        {...props}
    />
)

export const FieldDescription = ({ className, ...props }: React.ComponentProps<"p">) => (
    <p
        data-slot="field-description"
        className={`text-muted-foreground text-sm leading-normal font-normal [&>a:hover]:opacity-50 [&>a]:underline [&>a]:underline-offset-4${className ? ` ${className}` : ""}`}
        {...props}
    />
)

export const FieldError = ({
    className,
    children,
    errors,
    ...props
}: React.ComponentProps<"div"> & {
    errors?: Array<{ message?: string } | undefined>
}) => {
    const content = React.useMemo(() => {
        if (children) return children
        if (!errors) return null
        if (errors.length === 1 && errors[0]?.message) return errors[0].message

        return (
            <ul className="ml-4 list-disc space-y-1">
                {errors.map(
                    (error, index) =>
                        error?.message && <li key={index}>{error.message}</li>
                )}
            </ul>
        )
    }, [children, errors])

    if (!content) return null

    return (
        <div
            role="alert"
            data-slot="field-error"
            className={`text-red-500 text-sm font-normal${className ? ` ${className}` : ""}`}
            {...props}
        >
            {content}
        </div>
    )
}
