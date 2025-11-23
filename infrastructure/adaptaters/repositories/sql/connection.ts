import { Pool, PoolConfig } from "pg"
import { InfrastructureError } from "@application/errors"
import { readEnv } from "@adapters/utils/env"

let pool: Pool | null = null

function resolvePoolConfig(): PoolConfig {
    const connectionString = process.env.DATABASE_URL
    if (connectionString) {
        return { connectionString }
    }

    try {
        return {
            host: readEnv("DB_HOST"),
            port: Number(readEnv("DB_PORT")),
            user: readEnv("POSTGRES_USER"),
            password: readEnv("POSTGRES_PASSWORD"),
            database: readEnv("POSTGRES_DB"),
        }
    } catch (error) {
        console.error("Database configuration error:", error)
        throw new InfrastructureError("Database unavailable. Please try again later.")
    }
}

export function getPool(): Pool {
    if (!pool) {
        try {
            pool = new Pool(resolvePoolConfig())
        } catch (error) {
            console.error("Failed to initialize connection pool", error)
            throw new InfrastructureError("Database unavailable. Please try again later.")
        }
    }
    return pool
}

export async function closePool(): Promise<void> {
    if (!pool) return

    try {
        await pool.end()
    } catch (error) {
        console.error("Failed to close connection pool", error)
        throw new InfrastructureError("Database unavailable. Please try again later.")
    }
    pool = null
}