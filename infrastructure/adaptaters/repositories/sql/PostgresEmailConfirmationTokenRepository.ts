import { Pool } from "pg"
import { EmailConfirmationTokenRepository } from "@application/repositories/emailConfirmationTokens"
import { EmailConfirmationToken } from "@domain/entities/emailConfirmationToken"
import { InfrastructureError } from "@application/errors"
import { ensureError } from "@application/utils/errors"
import { EmailConfirmationTokenRow } from "@adapters/repositories/types/EmailConfirmationTokenRow"

export class PostgresEmailConfirmationTokenRepository implements EmailConfirmationTokenRepository {
    constructor(private readonly pool: Pool) {}

    async save(token: EmailConfirmationToken): Promise<void> {
        try {
            await this.pool.query(
                `
                    INSERT INTO email_confirmation_tokens (user_id, token, expires_at)
                    VALUES ($1, $2, $3)
                    ON CONFLICT (user_id) DO UPDATE
                    SET token = $2, expires_at = $3
                `,
                [token.userId, token.token, token.expiresAt],
            )
        } catch (error) {
            this.handleDatabaseError(error)
        }
    }

    async findByToken(token: string): Promise<EmailConfirmationToken | null> {
        try {
            const result = await this.pool.query<EmailConfirmationTokenRow>(
                `
                    SELECT user_id, token, expires_at
                    FROM email_confirmation_tokens
                    WHERE token = $1
                    LIMIT 1
                `,
                [token],
            )

            if (result.rowCount === 0) {
                return null
            }

            return this.mapRowToToken(result.rows[0])
        } catch (error) {
            this.handleDatabaseError(error)
        }
    }

    async deleteByToken(token: string): Promise<void> {
        try {
            await this.pool.query(
                `
                    DELETE FROM email_confirmation_tokens
                    WHERE token = $1
                `,
                [token],
            )
        } catch (error) {
            this.handleDatabaseError(error)
        }
    }

    async deleteExpired(): Promise<void> {
        try {
            await this.pool.query(
                `
                    DELETE FROM email_confirmation_tokens
                    WHERE expires_at < NOW()
                `,
            )
        } catch (error) {
            this.handleDatabaseError(error)
        }
    }

    private mapRowToToken(row: EmailConfirmationTokenRow): EmailConfirmationToken {
        return new EmailConfirmationToken(row.user_id, row.token, row.expires_at)
    }

    private handleDatabaseError(unknownError: unknown): never {
        const error = ensureError(unknownError, "Unexpected database error")
        console.error("Database operation failed", error)
        throw new InfrastructureError("Database unavailable. Please try again later.")
    }
}