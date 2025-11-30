import { Account } from "@domain/entities/account"
export interface AccountRepository {
    save(account: Account): Promise<void>
    findByIBAN(IBAN: string): Promise<Account | null>
    findByOwnerId(ownerId: string): Promise<Account[]>
    createAccountForUser(userId: string, IBAN: string): Promise<void>
}