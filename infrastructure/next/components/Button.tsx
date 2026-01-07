import * as React from "react"

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    unstyled?: boolean
    primaryColor?: boolean
}

export const Button = ({ className, unstyled, primaryColor = true, ...props }: ButtonProps) => {
    const colorClasses = !unstyled
        ? primaryColor
            ? "bg-primary hover:bg-primary/50"
            : "bg-secondary hover:bg-secondary/50"
        : ""

    return (
        <button
            data-slot="button"
            className={
                `${unstyled
                    ? "cursor-pointer transition hover:opacity-50"
                    : `cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive text-primary-foreground border border-white ${colorClasses}`
                }${className ? ` ${className}` : ""}`
            }
            {...props}
        />
    )
}
