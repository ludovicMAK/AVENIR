import type { PropsWithChildren, ReactNode } from "react"
import Divider from "@/components/Divider"

type PageLayoutProps = {
    main: ReactNode
    aside?: ReactNode
}

export default function PageLayout({ main, aside }: PageLayoutProps) {
    return (
        <div className="h-full w-full flex flex-col xl:flex-row gap-10 xl:items-start">
            <section className="h-full max-h-main w-full py-12 flex flex-col gap-12 xl:min-h-0">
                {main}
            </section>

            {aside && <Divider className="xl:hidden" aria-hidden />}

            {aside && (
                <section className="h-full flex flex-col gap-4 py-12 min-w-0 md:min-w-120">
                    {aside}
                </section>
            )}
        </div>
    )
}
