import { getPool } from "@adapters/repositories/sql/connection"
import { InfrastructureError } from "@application/errors"

export async function ensureUsersTable(): Promise<void> {
    const client = getPool()
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY,
                lastname TEXT NOT NULL,
                firstname TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                role TEXT NOT NULL,
                password TEXT NOT NULL
            )
        `)
    } catch (error) {
        console.error("Failed to ensure users table", error)
        throw new InfrastructureError("Database unavailable. Please try again later.")
    }
}