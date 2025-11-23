import { getPool } from "@adapters/repositories/sql/connection"
import { InfrastructureError } from "@application/errors"

export async function ensureEmailConfirmationTokensTable(): Promise<void> {
    const client = getPool()
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS email_confirmation_tokens (
                user_id UUID NOT NULL,
                token TEXT NOT NULL UNIQUE,
                expires_at TIMESTAMP NOT NULL,
                PRIMARY KEY (user_id)
            )
        `)
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_email_confirmation_tokens_token 
            ON email_confirmation_tokens(token)
        `)
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_email_confirmation_tokens_expires_at 
            ON email_confirmation_tokens(expires_at)
        `)
    } catch (error) {
        console.error("Failed to ensure email_confirmation_tokens table", error)
        throw new InfrastructureError("Database unavailable. Please try again later.")
    }
}

