import { Pool, PoolConfig } from "pg"
import { InfrastructureError } from "@application/errors"

let pool: Pool | null = null

function resolvePoolConfig(): PoolConfig {
    const connectionString = process.env.DATABASE_URL
    if (connectionString) {
        return { connectionString }
    }

    const readEnv = (key: string): string => {
        const value = process.env[key]
        if (!value) {
            console.error(`Missing required environment variable: ${key}`)
            throw new InfrastructureError("Database unavailable. Please try again later.")
        }
        return value
    }

    const port = Number.parseInt(readEnv("DB_PORT"), 10)
    if (Number.isNaN(port)) {
        console.error("Environment variable DB_PORT must be a number.")
        throw new InfrastructureError("Database unavailable. Please try again later.")
    }

    return {
        host: readEnv("DB_HOST"),
        port,
        user: readEnv("POSTGRES_USER"),
        password: readEnv("POSTGRES_PASSWORD"),
        database: readEnv("POSTGRES_DB"),
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
