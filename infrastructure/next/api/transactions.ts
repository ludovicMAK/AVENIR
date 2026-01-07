import { request } from "./client"
import { ApiError } from "@/lib/errors"
import { isJsonObject } from "@/lib/json"
import { JsonValue } from "@/types/json"
import { TransactionHistoryItem } from "@/types/transactions"

type TransactionsResponseBody = {
    transactions?: JsonValue
}

const invalidTransactionsResponseError = () =>
    new ApiError("INFRASTRUCTURE_ERROR", "Invalid transactions payload received from API.")

const toTransaction = (value: JsonValue): TransactionHistoryItem => {
    if (!isJsonObject(value)) throw invalidTransactionsResponseError()

    const id = value.id
    const direction = value.direction
    const amount = value.amount
    const name = value.name
    const executedAt = value.executedAt
    const status = value.status
    const transferId = value.transferId
    const counterpartyIban = value.counterpartyIban

    if (
        typeof id !== "string" ||
        (direction !== "debit" && direction !== "credit") ||
        typeof amount !== "number" ||
        typeof name !== "string" ||
        typeof executedAt !== "string" ||
        typeof status !== "string" ||
        typeof transferId !== "string"
    ) {
        throw invalidTransactionsResponseError()
    }

    return {
        id,
        direction,
        amount,
        name,
        executedAt,
        status,
        transferId,
        counterpartyIban: typeof counterpartyIban === "string" ? counterpartyIban : undefined,
    }
}

const extractTransactions = (response: JsonValue): TransactionHistoryItem[] => {
    if (!isJsonObject(response)) throw invalidTransactionsResponseError()

    const transactionsJson = (response as TransactionsResponseBody).transactions
    if (!Array.isArray(transactionsJson)) throw invalidTransactionsResponseError()

    return transactionsJson.map(toTransaction)
}

export const transactionsApi = {
    async getByAccountId(
        accountId: string,
        {
            authToken,
            userId,
        }: {
            authToken?: string
            userId?: string
        } = {}
    ) {
        const headers: Record<string, string> = {}
        if (authToken) headers.Authorization = `Bearer ${authToken}`
        if (userId) headers["x-user-id"] = userId

        const response = await request<JsonValue>(`/accounts/${accountId}/transactions`, {
            headers,
        })

        return extractTransactions(response)
    },
}
