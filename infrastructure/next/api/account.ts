import { request } from "./client"
import { Account, AccountStatusValue, AccountTypeValue } from "@/types/accounts"
import { getCurrentUser } from "@/lib/users/server"
import { ApiError } from "@/lib/errors"
import { isJsonObject } from "@/lib/json"
import { JsonValue } from "@/types/json"

type AccountsResponseBody = {
    data?: {
        accounts?: JsonValue
    }
}

const invalidAccountsResponseError = () =>
    new ApiError("INFRASTRUCTURE_ERROR", "Invalid accounts payload received from API.")

const toPrimitiveValue = (value: JsonValue): string | null => {
    if (typeof value === "string") return value
    if (isJsonObject(value) && typeof value.value === "string") {
        return value.value
    }
    return null
}

const isAccountType = (value: string | null): value is AccountTypeValue =>
    value === "current" || value === "savings" || value === "trading"

const isAccountStatus = (value: string | null): value is AccountStatusValue =>
    value === "open" || value === "close"

const toAccount = (value: JsonValue): Account => {
    if (!isJsonObject(value)) throw invalidAccountsResponseError()

    const id = value.id
    const accountName = value.accountName
    const balance = value.balance
    const idOwner = value.idOwner
    const accountType = toPrimitiveValue(value.accountType)
    const status = toPrimitiveValue(value.status)
    const IBAN = value.IBAN
    const authorizedOverdraft = value.authorizedOverdraft
    const overdraftLimit = value.overdraftLimit
    const overdraftFees = value.overdraftFees

    if (
        typeof id !== "string" ||
        typeof accountName !== "string" ||
        typeof balance !== "number" ||
        typeof idOwner !== "string" ||
        !isAccountType(accountType)
    ) {
        throw invalidAccountsResponseError()
    }

    return {
        id,
        accountName,
        accountType,
        idOwner,
        balance,
        status: isAccountStatus(status) ? status : undefined,
        IBAN: typeof IBAN === "string" ? IBAN : undefined,
        authorizedOverdraft: typeof authorizedOverdraft === "boolean" ? authorizedOverdraft : undefined,
        overdraftLimit: typeof overdraftLimit === "number" ? overdraftLimit : undefined,
        overdraftFees: typeof overdraftFees === "number" ? overdraftFees : undefined,
    }
}

const extractAccounts = (response: JsonValue): Account[] => {
    if (!isJsonObject(response)) throw invalidAccountsResponseError()

    const data = response.data
    if (!isJsonObject(data)) throw invalidAccountsResponseError()

    const accountsJson = (data as AccountsResponseBody["data"])?.accounts
    if (!Array.isArray(accountsJson)) throw invalidAccountsResponseError()

    return accountsJson.map(toAccount)
}

export const accountsApi = {
    async getAccountsByUserId(userId: string) {
        const response = await request(`/users/${userId}/accounts`)
        return extractAccounts(response)
    }
}
