export const formatNumber = (numberValue: number, decimals: number) =>
    numberValue.toLocaleString("fr-FR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })

export const formatAmount = (
    amount: number,
    { showPlus = false, decimals }: { showPlus?: boolean; decimals?: number } = {},
) => {
    const resolvedDecimals = typeof decimals === "number" ? decimals : Number.isInteger(amount) ? 0 : 2
    const prefix = amount < 0 ? "- " : showPlus && amount >= 0 ? "+ " : ""
    return `${prefix}${formatNumber(Math.abs(amount), resolvedDecimals)}€`
}

export const formatDate = (dateString: string) => {
    const separator = dateString.includes("-") ? "-" : dateString.includes("/") ? "/" : null
    if (!separator) return dateString

    const dateParts = dateString.split(separator)
    if (dateParts.length !== 3) return dateString

    const [year, month, day] =
        separator === "-" ? dateParts.map(Number) : [Number(dateParts[2]), Number(dateParts[1]), Number(dateParts[0])]

    if ([year, month, day].some(Number.isNaN)) return dateString

    const monthNames = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.", "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."]
    const monthLabel = monthNames[month - 1]
    if (!monthLabel) return dateString

    return `${day} ${monthLabel} ${year}`
}

export const parseDate = (dateLabel: string) => {
    const separator = dateLabel.includes("-") ? "-" : dateLabel.includes("/") ? "/" : null
    if (!separator) return null

    const dateParts = dateLabel.split(separator)
    if (dateParts.length !== 3) return null

    const [year, month, day] =
        separator === "-" ? dateParts.map(Number) : [Number(dateParts[2]), Number(dateParts[1]), Number(dateParts[0])]

    if ([year, month, day].some(Number.isNaN)) return null

    const parsedDate = new Date(year, month - 1, day)
    if (Number.isNaN(parsedDate.getTime())) return null
    return parsedDate
}
