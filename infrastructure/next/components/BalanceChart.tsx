"use client"

import { useMemo, useState } from "react"
import { Card } from "@/components/Card"
import { Button } from "@/components/Button"
import { Line } from "react-chartjs-2"
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    type ChartOptions,
} from "chart.js"
import { formatAmount, formatDate } from "@/lib/formatters"

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip
)

type OldTransaction = {
    id: string
    direction: "credit" | "debit"
    amount: number
    name: string
    executedAt: string
    status: "validated" | "posted"
    transferId: string
    counterpartyIban: string
}

type ChartPoint = {
    label: string
    value: number
}

const timeframeOptions = ["1D", "1W", "1M", "1Y", "Max"] as const
type Timeframe = typeof timeframeOptions[number]

const pad2 = (numberToPad: number) => String(numberToPad).padStart(2, "0")
const toYMD = (date: Date) =>
    `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())}`

const parseFR = (label: string) => {
    const [dateString, timeString] = label.split(" ")
    if (!dateString) return null
    const [day, month, year] = dateString.split("/").map(Number)
    if (!day || !month || !year) return null
    let hour = 0, minute = 0, second = 0
    if (timeString) {
        const [hourComponent, minuteComponent, secondComponent] = timeString.split(":")
        hour = Number(hourComponent) || 0
        minute = Number(minuteComponent) || 0
        second = Number(secondComponent) || 0
    }
    const millisecondsSinceEpoch = Date.UTC(year, month - 1, day, hour, minute, second)
    const parsedDate = new Date(millisecondsSinceEpoch)
    return isNaN(parsedDate.getTime()) ? null : parsedDate
}

const toDateTime = (label: string) => parseFR(label)

const toDateOnly = (label: string) => {
    const parsedDate = parseFR(label)
    if (!parsedDate) return null
    return new Date(Date.UTC(parsedDate.getUTCFullYear(), parsedDate.getUTCMonth(), parsedDate.getUTCDate()))
}

const formatDateNoYear = (ymd: string) => {
    const formatted = formatDate(ymd)
    return formatted.replace(/\s\d{4}$/, "")
}

const formatHour = (date: Date) => {
    const plusOneHour = new Date(date.getTime() + 60 * 60 * 1000)
    return new Intl.DateTimeFormat("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "UTC",
    }).format(plusOneHour)
}

const isNumberLabel = (label: string) => /^\d+$/.test(label)

const formatK = (value: number) => {
    const absoluteValue = Math.abs(value)
    if (absoluteValue >= 1000) {
        return `${Math.round(value / 1000)}K`
    }
    return String(Math.round(value))
}

const formatPercent = (value: number) => {
    const sign = value > 0 ? "+" : value < 0 ? "-" : ""
    return `${sign}${Math.abs(value).toFixed(2)}%`
}

const niceStep = (range: number) => {
    const absoluteRange = Math.abs(range)
    if (absoluteRange === 0) return 1
    const exponent = Math.floor(Math.log10(absoluteRange))
    const base = Math.pow(10, exponent)
    const factors = [1, 2, 5]
    for (let i = 0; i < factors.length; i++) {
        if (absoluteRange <= factors[i] * base) {
            return (factors[i] * base) / 10
        }
    }
    return base
}

const getYTicks = (values: number[]) => {
    if (values.length === 0) {
        return { min: 0, mid: 0, max: 0 }
    }

    const rawMin = Math.min(...values)
    const rawMax = Math.max(...values)

    if (rawMin === rawMax) {
        const padding = rawMin === 0 ? 1 : Math.abs(rawMin) * 0.1
        return {
            min: rawMin - padding,
            mid: rawMin,
            max: rawMin + padding,
        }
    }

    const range = rawMax - rawMin
    const step = niceStep(range)
    const max = Math.ceil(rawMax / step) * step
    const min = Math.floor(rawMin / step) * step
    const mid = min + (max - min) / 2

    return { min, mid, max }
}

const getXTicks = (points: ChartPoint[], timeframe: Timeframe, maxTicks = 5) => {
    if (points.length === 0) return []

    const formatTickNon1D = (label: string) => {
        const d = toDateOnly(label)
        if (!d) return label
        return formatDateNoYear(toYMD(d))
    }

    const formatTick1D = (label: string) => {
        const d = toDateTime(label)
        if (!d) return label
        return formatHour(d)
    }

    if (points.length <= maxTicks) {
        if (timeframe === "1D") {
            return points.map((p) => formatTick1D(p.label))
        }

        return points.map((p) => formatTickNon1D(p.label))
    }

    const first = points[0].label
    const last = points[points.length - 1].label

    if (timeframe === "1D") {
        const startDate = toDateTime(first)
        const endDate = toDateTime(last)

        if (startDate && endDate) {
            const start = startDate.getTime()
            const end = endDate.getTime()
            const step = (end - start) / (maxTicks - 1)

            return Array.from({ length: maxTicks }, (_, i) => {
                const t = start + step * i
                const d = new Date(t)
                return formatHour(d)
            })
        }
    }

    const startDate = toDateOnly(first)
    const endDate = toDateOnly(last)

    if (startDate && endDate) {
        const start = startDate.getTime()
        const end = endDate.getTime()
        const step = (end - start) / (maxTicks - 1)

        return Array.from({ length: maxTicks }, (_, i) => {
            const t = start + step * i
            return formatDateNoYear(toYMD(new Date(t)))
        })
    }

    if (isNumberLabel(first) && isNumberLabel(last)) {
        const start = Number(first)
        const end = Number(last)
        const step = (end - start) / (maxTicks - 1)

        return Array.from({ length: maxTicks }, (_, i) => String(Math.round(start + step * i)))
    }

    const n = points.length
    const step = (n - 1) / (maxTicks - 1)
    const indices = Array.from({ length: maxTicks }, (_, i) => Math.round(i * step))

    if (timeframe === "1D") {
        return indices.map((idx) => {
            const p = points[Math.min(n - 1, Math.max(0, idx))]
            return formatTick1D(p.label)
        })
    }

    return indices.map((idx) => {
        const p = points[Math.min(n - 1, Math.max(0, idx))]
        return formatTickNon1D(p.label)
    })
}

const collapseToDailyLast = (points: (ChartPoint & { date: Date })[]) => {
    const byDay = new Map<
        string,
        { first: ChartPoint & { date: Date }; last: ChartPoint & { date: Date } }
    >()

    for (const p of points) {
        const key = toYMD(p.date)
        const existing = byDay.get(key)
        if (!existing) {
            byDay.set(key, { first: p, last: p })
        } else {
            byDay.set(key, { first: existing.first, last: p })
        }
    }

    const result: (ChartPoint & { date: Date })[] = []

    for (const [_, { first, last }] of byDay) {
        result.push(first)
        if (last !== first) result.push(last)
    }

    return result.sort((a, b) => a.date.getTime() - b.date.getTime())
}

const windowStartFor = (end: Date, timeframe: Timeframe): Date | null => {
    if (timeframe === "Max") return null

    if (timeframe === "1D") {
        return startOfDay(end)
    }

    const start = new Date(end)
    if (timeframe === "1W") start.setUTCDate(start.getUTCDate() - 7)
    if (timeframe === "1M") start.setUTCMonth(start.getUTCMonth() - 1)
    if (timeframe === "1Y") start.setUTCFullYear(start.getUTCFullYear() - 1)
    return start
}

const sortTransactions = (transactions: OldTransaction[]) =>
    [...transactions]
        .map((t) => ({ ...t, date: new Date(t.executedAt) }))
        .filter((t) => !isNaN(t.date.getTime()))
        .sort((a, b) => a.date.getTime() - b.date.getTime())

const signedAmount = (t: OldTransaction) => (t.direction === "credit" ? t.amount : -t.amount)

const buildWindowDataFromTransactions = (transactions: OldTransaction[], timeframe: Timeframe) => {
    const sorted = sortTransactions(transactions)

    const anchorRaw = sorted.length > 0 ? sorted[sorted.length - 1].date : new Date()
    const endDate = timeframe === "1D" ? anchorRaw : startOfDay(anchorRaw)

    const windowStartRaw = windowStartFor(endDate, timeframe)
    const windowStart = windowStartRaw && timeframe !== "1D" ? startOfDay(windowStartRaw) : windowStartRaw

    if (sorted.length === 0) {
        const startLabel = formatFRDateTimeLabel(windowStart ?? endDate)
        const endLabel = formatFRDateTimeLabel(endDate)
        return {
            series: [
                { label: startLabel, value: 0 },
                { label: endLabel, value: 0 },
            ],
            stats: { incoming: 0, outgoing: 0, change: 0, changePercent: 0 },
        }
    }

    const initialValue =
        timeframe === "Max" || !windowStart
            ? 0
            : sorted
                  .filter((t) => t.date.getTime() < windowStart.getTime())
                  .reduce((acc, t) => acc + signedAmount(t), 0)

    const windowTransactions =
        timeframe === "Max" || !windowStart
            ? sorted
            : sorted.filter((t) => t.date.getTime() >= windowStart.getTime() && t.date.getTime() <= endDate.getTime())

    const points: (ChartPoint & { date: Date })[] = []

    let balance = initialValue

    if (timeframe === "1D") {
        const startPointDate = windowStart ?? endDate
        points.push({
            label: formatFRDateTimeLabel(startPointDate),
            value: initialValue,
            date: startPointDate,
        })

        for (const tx of windowTransactions) {
            balance += signedAmount(tx)
            points.push({
                label: formatFRDateTimeLabel(tx.date),
                value: balance,
                date: tx.date,
            })
        }
    } else {
        const startPointDate =
            timeframe === "Max"
                ? sorted[0].date
                : windowStart ?? sorted[0].date

        points.push({
            label: formatFRDateTimeLabel(startPointDate),
            value: initialValue,
            date: startPointDate,
        })

        for (const tx of windowTransactions) {
            balance += signedAmount(tx)
            points.push({
                label: formatFRDateTimeLabel(tx.date),
                value: balance,
                date: tx.date,
            })
        }

        const lastPointDate = points[points.length - 1].date
        if (lastPointDate.getTime() < endDate.getTime()) {
            points.push({
                label: formatFRDateTimeLabel(endDate),
                value: balance,
                date: endDate,
            })
        }
    }

    const workingPoints = timeframe === "1D" ? points : collapseToDailyLast(points)

    let incoming = 0
    let outgoing = 0

    for (let i = 1; i < workingPoints.length; i++) {
        const diff = workingPoints[i].value - workingPoints[i - 1].value
        if (diff > 0) incoming += diff
        else outgoing += Math.abs(diff)
    }

    const startValue = workingPoints[0]?.value ?? 0
    const endValue = workingPoints[workingPoints.length - 1]?.value ?? 0
    const change = endValue - startValue
    const changePercent = startValue !== 0 ? (change / startValue) * 100 : 0

    const series =
        workingPoints.length >= 2
            ? workingPoints.map(({ label, value }) => ({ label, value }))
            : workingPoints.length === 1
                  ? [
                        { label: workingPoints[0].label, value: workingPoints[0].value },
                        { label: workingPoints[0].label, value: workingPoints[0].value },
                    ]
                  : [
                        { label: formatFRDateTimeLabel(endDate), value: 0 },
                        { label: formatFRDateTimeLabel(endDate), value: 0 },
                    ]

    return {
        series,
        stats: {
            incoming,
            outgoing,
            change,
            changePercent,
        },
    }
}

const isOldTransactionArray = (value: unknown): value is OldTransaction[] => {
    return (
        Array.isArray(value) &&
        value.every((v) => {
            if (!v || typeof v !== "object") return false
            const t = v as Record<string, unknown>
            return (
                typeof t.executedAt === "string" &&
                typeof t.amount === "number" &&
                (t.direction === "credit" || t.direction === "debit")
            )
        })
    )
}

const startOfDay = (date: Date) =>
    new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))

const formatFRDateTimeLabel = (date: Date) => {
    return `${pad2(date.getUTCDate())}/${pad2(date.getUTCMonth() + 1)}/${date.getUTCFullYear()} ${pad2(date.getUTCHours())}:${pad2(
        date.getUTCMinutes()
    )}`
}

export default function BalanceChart({
    transactions,
    chartPoints
}: {
    transactions?: OldTransaction[] | null
    chartPoints?: unknown
}) {
    const [timeframe, setTimeframe] = useState<Timeframe>("Max")

    const safeTransactions = useMemo(() => {
        if (isOldTransactionArray(transactions)) return transactions
        if (isOldTransactionArray(chartPoints)) return chartPoints
        return []
    }, [transactions, chartPoints])

    const { series: filteredPoints, stats } = useMemo(() => {
        return buildWindowDataFromTransactions(safeTransactions, timeframe)
    }, [safeTransactions, timeframe])

    const xTicks = useMemo(
        () => getXTicks(filteredPoints, timeframe, 5),
        [filteredPoints, timeframe]
    )

    const yTickValues = useMemo(() => {
        return getYTicks(filteredPoints.map((p) => p.value))
    }, [filteredPoints])

    const data = useMemo(() => {
        const hasSinglePoint = filteredPoints.length === 1

        return {
            labels: filteredPoints.map((p) => p.label),
            datasets: [
                {
                    data: filteredPoints.map((p) => p.value),
                    borderColor: "white",
                    backgroundColor: "transparent",
                    borderWidth: 1.8,
                    pointRadius: hasSinglePoint ? 3 : 0,
                    pointHoverRadius: hasSinglePoint ? 4 : 0,
                    tension: 0.35,
                },
            ],
        }
    }, [filteredPoints])

    const options: ChartOptions<"line"> = useMemo(() => {
        return {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            layout: {
                padding: {
                    left: 18,
                    right: 12,
                    top: 18,
                    bottom: 42,
                },
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    enabled: true,
                    displayColors: false,
                    intersect: false,
                    mode: "index",
                    callbacks: {
                        title: (items) => {
                            const raw = String(items[0]?.label ?? "")

                            if (timeframe === "1D") {
                                const d = toDateTime(raw)
                                if (!d) return raw
                                return formatHour(d)
                            }

                            const d = toDateOnly(raw)
                            if (!d) return raw
                            return formatDateNoYear(toYMD(d))
                        },
                    },
                },
            },
            scales: {
                x: { display: false },
                y: {
                    display: false,
                    min: yTickValues.min,
                    max: yTickValues.max,
                    grid: {
                        color: "rgba(255,255,255,0.08)",
                    },
                },
            },
        }
    }, [yTickValues.max, yTickValues.min, timeframe])

    return (
        <Card className="rounded-xl bg-secondary p-6 text-white">
            <div className="w-full flex justify-between md:justify-start gap-0 md:gap-10 font-bold">
                {timeframeOptions.map((option) => (
                    <Button
                        key={option}
                        type="button"
                        onClick={() => setTimeframe(option)}
                        unstyled
                        className={`${option === timeframe ? "underline underline-offset-4" : ""} hover:underline hover:underline-offset-4`}
                    >
                        {option}
                    </Button>
                ))}
            </div>

            <div className="space-y-8">
                <div className="flex h-83 overflow-hidden rounded-lg bg-primary w-full">
                    <div className="relative flex-1">
                        <div className="absolute inset-0">
                            <Line key={timeframe} data={data} options={options} />
                        </div>

                        <div className="w-full absolute left-6 right-6 bottom-4 flex items-center justify-between text-xs font-semibold text-white">
                            {xTicks.map((label, i) => (
                                <span key={`${label}-tick-${i}`}>{label}</span>
                            ))}
                        </div>
                    </div>

                    <div className="flex w-20 flex-col justify-between py-8 pr-4 text-xs font-semibold text-white">
                        <span className="text-right">{formatK(yTickValues.max)}</span>
                        <span className="text-right">{formatK(yTickValues.mid)}</span>
                        <span className="text-right">{formatK(yTickValues.min)}</span>
                    </div>
                </div>
            </div>

            <div>
                <div className="flex items-center justify-between">
                    <span>Total incoming :</span>
                    <span className="text-white">{formatAmount(stats.incoming)}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span>Total outgoing :</span>
                    <span className="text-white">{formatAmount(-stats.outgoing)}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span>Balance change :</span>
                    <span className="text-white">
                        {formatAmount(stats.change, { showPlus: true })} ({formatPercent(stats.changePercent)})
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <Button type="button">
                    Deposit
                </Button>
                <Button type="button">
                    Withdraw
                </Button>
            </div>
        </Card>
    )
}
