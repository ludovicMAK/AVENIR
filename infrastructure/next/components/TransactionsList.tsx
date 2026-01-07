"use client"

import { useMemo, useState } from "react"
import { IconSearch } from "@tabler/icons-react"
import { Input } from "@/components/Input"

type Transaction = {
    label: string
    date: string
    amount: string
}

type TransactionGroup = {
    dayKey: string
    dayLabel: string
    items: Transaction[]
}

type TransactionsListProps = {
    transactionGroups: TransactionGroup[]
}

const normalize = (value: string) => value.trim().toLowerCase()
const toMidnightMs = (value: string) => {
    if (!value) return null
    const parsed = Date.parse(`${value}T00:00:00Z`)
    return Number.isNaN(parsed) ? null : parsed
}

export default function TransactionsList({ transactionGroups }: TransactionsListProps) {
    const [query, setQuery] = useState("")
    const [rangeInput, setRangeInput] = useState("")

    const parseRangeInput = (value: string) => {
        const trimmed = value.trim()
        if (!trimmed) return { start: null as string | null, end: null as string | null }

        const parts = trimmed.split(/\s*-\s*/)
        if (parts.length === 1) {
            return { start: parts[0] || null, end: null }
        }

        const [start, end] = parts
        return { start: start || null, end: end || null }
    }

    const filteredGroups = useMemo(() => {
        const normalizedQuery = normalize(query)
        const { start, end } = parseRangeInput(rangeInput)
        const startMs = toMidnightMs(start ?? "")
        const endMs = toMidnightMs(end ?? "")
        const [minMs, maxMs] =
            startMs != null && endMs != null && endMs < startMs ? [endMs, startMs] : [startMs, endMs]

        const filteredByDateRange =
            minMs == null && maxMs == null
                ? transactionGroups
                : transactionGroups.filter((group) => {
                      const dayMs = toMidnightMs(group.dayKey)
                      if (dayMs == null) return false
                      if (minMs != null && dayMs < minMs) return false
                      if (maxMs != null && dayMs > maxMs) return false
                      return true
                  })

        if (!normalizedQuery) {
            return filteredByDateRange
        }

        return filteredByDateRange
            .map((group) => ({
                ...group,
                items: group.items.filter((item) =>
                    normalize(`${group.dayLabel} ${item.label} ${item.date} ${item.amount}`).includes(normalizedQuery)
                ),
            }))
            .filter((group) => group.items.length > 0)
    }, [query, rangeInput, transactionGroups])

    return (
        <div className="h-full flex flex-col gap-4 flex-1 min-h-0">
            <div className="flex flex-row gap-3">
                <div className="relative w-full">
                    <Input
                        type="search"
                        placeholder="Search transactions"
                        buttonStyle
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                    />
                    <IconSearch
                        size={16}
                        stroke={2.5}
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white"
                    />
                </div>
            </div>

            <div className="h-full space-y-6 flex-1 min-h-0 overflow-auto">
                {filteredGroups.length === 0 ? (
                    <p className="text-white/80">No transactions found</p>
                ) : (
                    filteredGroups.map((group) => (
                        <div key={group.dayKey} className="space-y-3">
                            <p className="text-base font-semibold text-white">{group.dayLabel}</p>
                            <div className="space-y-3">
                                {group.items.map((item, idx) => (
                                    <div
                                        key={`${group.dayKey}-${idx}`}
                                        className="flex items-center justify-between rounded-xl bg-secondary px-6 py-4"
                                    >
                                        <div className="space-y-1">
                                            <p className="font-semibold">{item.label}</p>
                                            <p className="text-sm text-white">{item.date}</p>
                                        </div>
                                        <p className="text-lg font-semibold text-white">{item.amount}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
