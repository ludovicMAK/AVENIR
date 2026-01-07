import * as React from "react"

type DividerProps = React.ComponentProps<"div">

const Divider = ({ className, ...props }: DividerProps) => (
    <div className={`border-t border-white${className ? ` ${className}` : ""}`} {...props} />
)

export default Divider
