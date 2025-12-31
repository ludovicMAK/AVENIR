'use client'

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { IconPower, IconUser } from "@tabler/icons-react"
import { clearAuthentication } from "@/lib/auth/client"
import { UserSummary } from "@/types/users"

type HeaderProps = {
    initialUser: UserSummary | null
}

type NavItem = {
    label?: string
    href: string
    icon?: React.ReactNode
    mobileLabel?: string
}

const mainLinks: NavItem[] = [
    { label: "Investments", href: "#investments" },
    { label: "Transfers", href: "#transfers" },
    { label: "News", href: "#news" },
]

const minHeight = "h-10"
const maxHeight = "h-screen"

const HamburgerBar = ({ className = '' }: { className?: string }) => (
    <span className={`h-0.75 w-8 bg-white block transition-all duration-300 ease-in-out ${className}`} />
)

export default function Header({ initialUser }: HeaderProps) {
    const [sideLinksVisible, setSideLinksVisible] = useState(true)
    const [currentUser, setCurrentUser] = useState<UserSummary | null>(initialUser)
    const router = useRouter()

    useEffect(() => {
        setCurrentUser(initialUser)
    }, [initialUser])

    useEffect(() => {
        const mediaQuery = window.matchMedia('(min-width: 768px)')
        const handleChange = (event: MediaQueryListEvent | MediaQueryList) => {
            if (event.matches) {
                setSideLinksVisible(true)
            }
        }

        handleChange(mediaQuery)
        mediaQuery.addEventListener('change', handleChange)
        return () => mediaQuery.removeEventListener('change', handleChange)
    }, [])

    useEffect(() => {
        document.body.style.overflow = sideLinksVisible ? '' : 'hidden'
        return () => {
            document.body.style.overflow = ''
        }
    }, [sideLinksVisible])

    const toggleSideLinks = () => setSideLinksVisible((prev) => !prev)
    const closeSideLinks = () => setSideLinksVisible(true)
    const handleLogout = () => {
        clearAuthentication()
        closeSideLinks()
        router.replace('/login')
        router.refresh()
    }

    const accountLinks: NavItem[] = [
        {
            label: currentUser ? `${currentUser.firstname} ${currentUser.lastname}` : undefined,
            href: '#account',
            icon: <IconUser className="h-5 w-5" stroke={2.5} />,
        },
        { href: '#logout', icon: <IconPower className="h-5 w-5" stroke={2.5} />, mobileLabel: 'Deconnexion' },
    ]

    return (
        <header className="fixed top-0 left-0 flex items-center w-full z-50 bg-primary text-white border-b border-white shadow-md">
            <nav
                className={`layout flex flex-row items-center justify-center my-4 ${
                    sideLinksVisible ? minHeight : maxHeight
                } transition-[height] duration-700 ease-in-out overflow-hidden`}
            >
                <ul className="flex flex-col md:flex-row items-start md:items-center w-full h-full gap-6 md:gap-0">
                    <li className={`shrink-0 flex flex-row justify-between w-full md:w-auto md:mb-0 mx-0 md:mr-auto 2xl:mx-16 4xl:mx-22 ${minHeight}`}>
                        <Link
                            href="/"
                            className="h-full flex items-center hover:text-white italic font-semibold text-2xl"
                            onClick={closeSideLinks}
                        >
                            AVENIR
                        </Link>
                        <button
                            className="flex flex-col h-auto justify-between my-2 cursor-pointer md:hidden"
                            onClick={toggleSideLinks}
                            aria-label="Toggle menu"
                            aria-expanded={!sideLinksVisible}
                        >
                            <HamburgerBar className={sideLinksVisible ? 'opacity-100' : 'opacity-0'} />
                            <HamburgerBar className={sideLinksVisible ? 'rotate-0' : '-rotate-45'} />
                            <HamburgerBar className={sideLinksVisible ? 'rotate-0' : 'rotate-45 -translate-y-2.5'} />
                        </button>
                    </li>

                    <li className="flex-1 w-full flex flex-col md:flex-row justify-start md:justify-end">
                        <ul className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-2 text-sm font-bold h-full md:h-auto text-white">
                            {mainLinks.map((link, index) => (
                                <React.Fragment key={link.label || `main-${index}`}>
                                    <li className="w-full md:w-auto flex items-center">
                                        <Link
                                            href={link.href}
                                            className="hover:text-white block"
                                            onClick={closeSideLinks}
                                        >
                                            <span className="flex items-center gap-2">
                                                {link.label && <span>{link.label}</span>}
                                                {link.icon}
                                            </span>
                                        </Link>
                                    </li>
                                    {index < mainLinks.length - 1 && (
                                        <li className="hidden md:flex items-center" aria-hidden>
                                            <span className="h-6 border-l border-white/70 mx-3" />
                                        </li>
                                    )}
                                </React.Fragment>
                            ))}

                            <li className="flex items-center w-full md:w-auto" aria-hidden>
                                <span className="w-full border-t border-white/40 md:w-px md:h-6 md:border-l md:border-t-0 md:mx-3 md:border-white/70" />
                            </li>

                            {accountLinks.map((link, index) => (
                                <React.Fragment key={link.label || `account-${index}`}>
                                    <li className="w-full md:w-auto flex items-center">
                                        {link.href === '#logout' ? (
                                        <button
                                            type="button"
                                            className="hover:text-white block text-left w-full cursor-pointer"
                                            onClick={handleLogout}
                                            aria-label="Se deconnecter"
                                        >
                                                <span className="flex md:flex-row items-center gap-2">
                                                    {link.icon}
                                                    {link.label && <span>{link.label}</span>}
                                                    {link.mobileLabel && <span className="md:hidden">{link.mobileLabel}</span>}
                                                </span>
                                            </button>
                                        ) : (
                                            <Link
                                                href={link.href}
                                                className="hover:text-white block"
                                                onClick={closeSideLinks}
                                            >
                                                <span className="flex md:flex-row items-center gap-2">
                                                    {link.icon}
                                                    {link.label && <span>{link.label}</span>}
                                                    {link.mobileLabel && <span className="md:hidden">{link.mobileLabel}</span>}
                                                </span>
                                            </Link>
                                        )}
                                    </li>
                                    {index < accountLinks.length - 1 && (
                                        <li className="hidden md:flex items-center" aria-hidden>
                                            <span className="h-6 border-l border-white/70 mx-3" />
                                        </li>
                                    )}
                                </React.Fragment>
                            ))}
                        </ul>
                    </li>
                </ul>
            </nav>
        </header>
    )
}
