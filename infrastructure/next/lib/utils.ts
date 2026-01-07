export const getCssVar = (name: string, convertRemToPx?: boolean) => {
    const rawValue = getComputedStyle(document.documentElement).getPropertyValue(name).trim()

    if (convertRemToPx) {
        const lowerValue = rawValue.toLowerCase()
        const numericPart = lowerValue.endsWith('rem') ? lowerValue.slice(0, -3) : lowerValue
        const remValue = parseFloat(numericPart)
        return `${remValue * 16}px`
    }

    return rawValue
}