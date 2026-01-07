import * as React from "react"

type InputProps = React.ComponentProps<"input"> & {
    buttonStyle?: boolean
}

export const Input = ({ className, type, buttonStyle, ...props }: InputProps) => {
    const base =
        "file:text-foreground placeholder:text-muted-foreground border-input w-full min-w-0 rounded-md border bg-white text-primary px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-secondary file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus:bg-white focus-visible:bg-white active:bg-white focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] autofill:bg-white autofill:text-primary aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"

    const buttonLike =
        "w-full min-w-0 rounded-md border border-white bg-secondary px-4 py-2 text-sm font-semibold text-white placeholder:text-white caret-white transition focus:bg-secondary focus-visible:ring-white/50 focus-visible:ring-[3px]"

    const resolved = `${buttonStyle ? buttonLike : base}${className ? ` ${className}` : ""}`

    return (
        <input
            type={type}
            data-slot="input"
            className={resolved}
            {...props}
        />
    )
}
