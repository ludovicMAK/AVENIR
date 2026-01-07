import * as React from "react"
import { IconPencil } from "@tabler/icons-react"

import { Button } from "@/components/Button"

type EditableTitleProps = {
    title: React.ReactNode
    ariaLabel: string
    rightContent?: React.ReactNode
    showDivider?: boolean
    className?: string
    titleClassName?: string
}

const EditableTitle = ({
    title,
    ariaLabel,
    rightContent,
    showDivider,
    className,
    titleClassName,
}: EditableTitleProps) => (
    <div className={`flex flex-wrap items-center justify-between gap-1${className ? ` ${className}` : ""}`}>
        <div className="flex flex-wrap items-center gap-2">
            <span className={`truncate${titleClassName ? ` ${titleClassName}` : ""}`}>{title}</span>
            {showDivider && <span className="h-6 w-px bg-white" aria-hidden />}
            <Button type="button" unstyled aria-label={ariaLabel}>
                <IconPencil size={22} stroke={2.5} />
            </Button>
        </div>
        {rightContent}
    </div>
)

export default EditableTitle
