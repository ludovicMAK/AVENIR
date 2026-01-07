export type TransactionDirection = "debit" | "credit"

export type TransactionStatus = "posted" | "validated" | string

export type TransactionHistoryItem = {
    id: string
    direction: TransactionDirection
    amount: number
    name: string
    executedAt: string
    status: TransactionStatus
    transferId: string
    counterpartyIban?: string
}
