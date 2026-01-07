import * as React from "react"
import Link from "next/link"

type CardProps = React.ComponentProps<"div"> & {
    asLink?: boolean
    linkProps?: React.ComponentProps<typeof Link>
}

export const Card = ({ className, asLink, linkProps, ...props }: CardProps) => {
    const content = (
        <div
            data-slot="card"
            className={`h-full bg-secondary text-card-foreground flex flex-col justify-between gap-6 rounded-lg py-8 shadow-sm${className ? ` ${className}` : ""}`}
            {...props}
        />
    )

    if (!asLink || !linkProps?.href) return content

    return (
        <Link
            {...linkProps}
            className={`block text-left w-full rounded-lg border border-transparent hover:border-white transition hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white${linkProps?.className ? ` ${linkProps.className}` : ""}`}
        >
            {content}
        </Link>
    )
}

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
