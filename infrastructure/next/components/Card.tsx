import * as React from "react"

export const Card = ({ className, ...props }: React.ComponentProps<"div">) => (
    <div
        data-slot="card"
        className={`bg-secondary text-card-foreground flex flex-col gap-6 rounded-xl py-8 shadow-sm${className ? ` ${className}` : ""}`}
        {...props}
    />
)

export const CardHeader = ({ className, ...props }: React.ComponentProps<"div">) => (
    <div
        data-slot="card-header"
        className={`@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-8 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6${className ? ` ${className}` : ""}`}
        {...props}
    />
)

export const CardTitle = ({ className, ...props }: React.ComponentProps<"h2">) => (
    <h2
        data-slot="card-title"
        className={`leading-none font-semibold ${className ? ` ${className}` : ""}`}
        {...props}
    />
)

export const CardDescription = ({ className, ...props }: React.ComponentProps<"p">) => (
    <p
        data-slot="card-description"
        className={`text-muted-foreground text-sm${className ? ` ${className}` : ""}`}
        {...props}
    />
)

export const CardContent = ({ className, ...props }: React.ComponentProps<"div">) => (
    <div
        data-slot="card-content"
        className={`px-8${className ? ` ${className}` : ""}`}
        {...props}
    />
)
