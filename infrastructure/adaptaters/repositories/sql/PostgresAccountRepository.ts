import { Pool } from "pg"

import { AccountRepository } from "@application/repositories/account"
import { InfrastructureError } from "@application/errors"
import { ensureError } from "@application/utils/errors"
import { Account } from "@domain/entities/account"
import { AccountRow } from "../types/AccountRow"
import { AccountType } from "@domain/values/accountType"
import { StatusAccount } from "@domain/values/statusAccount"

export class PostgresAccountRepository implements AccountRepository {
    constructor(private readonly pool: Pool) {}

    async save(account: Account): Promise<void> {
        try {
            await this.pool.query(
                `
                    INSERT INTO accounts (IBAN,account_type, account_name, authorized_overdraft, status, id_owner)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                `,
                [
                    account.IBAN,
                    account.accountType,
                    account.accountName,
                    account.authorizedOverdraft,
                    account.status,
                    account.idOwner,
                ],
            )
        } catch (error) {
            this.handleDatabaseError(error)
        }
    }
    async findByIBAN(IBAN: string): Promise<Account | null> {
        try {
            const result = await this.pool.query<AccountRow>(
                `
                    SELECT IBAN, account_type, account_name, authorized_overdraft, status, id_owner
                    FROM accounts
                    WHERE IBAN = $1
                `,
                [IBAN],
            )

            if (result.rows.length === 0) {
                return null
            }

            const row = result.rows[0]
            return this.mapRowToUser(row)
        } catch (error) {
            this.handleDatabaseError(error)
        }
    }
    async findByOwnerId(ownerId: string): Promise<Account[]> {
        try {
            const result = await this.pool.query<AccountRow>(
                `
                    SELECT IBAN, account_type, account_name, authorized_overdraft, status, id_owner
                    FROM accounts
                    WHERE id_owner = $1
                `,
                [ownerId],
            )

            return result.rows.map((row) => this.mapRowToUser(row))
        } catch (error) {
            this.handleDatabaseError(error)
        }
    }


    private mapRowToUser(row: AccountRow): Account {
        return new Account(
            AccountType.from(row.account_type),
            row.IBAN,
            row.account_name,
            row.authorized_overdraft,
            StatusAccount.from(row.status),
            row.id_owner,
        )
    }
        async createAccountForUser(userId: string, IBAN: string): Promise<void> {
        try {
            await this.pool.query(
                `
                    INSERT INTO accounts (IBAN, account_type, account_name, authorized_overdraft, status, id_owner)
                    VALUES ($1, $2, $3, $4, $5, $6)
                `,
                [
                    IBAN,
                    AccountType.CURRENT.getValue(),
                    `compte courant`,
                    false,
                    StatusAccount.OPEN.getValue(),
                    userId,
                ],
            )
        } catch (error) {
            this.handleDatabaseError(error)
        }
    }

    private handleDatabaseError(unknownError: unknown): never {
        const error = ensureError(unknownError, "Unexpected database error")
        console.error("Database operation failed", error)
        throw new InfrastructureError("Database unavailable. Please try again later.")
    }
}