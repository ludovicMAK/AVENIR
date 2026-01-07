export type AccountTypeValue = "current" | "savings" | "trading"

export type AccountStatusValue = "open" | "close"

export type Account = {
    id: string
    accountName: string
    accountType: AccountTypeValue
    idOwner: string
    balance: number
    status?: AccountStatusValue
    IBAN?: string
    authorizedOverdraft?: boolean
    overdraftLimit?: number
    overdraftFees?: number
}
