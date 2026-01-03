export type TransactionInput = {
    idUser: string
    token: string
    description: string
    amount: number
    accountIBANFrom: string
    accountIBANTo: string
    direction: string
    dateExecuted: Date
}

