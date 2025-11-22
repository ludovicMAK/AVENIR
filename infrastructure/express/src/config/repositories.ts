import { UserRepository } from "@application/repositories/users"
import { EmailConfirmationTokenRepository } from "@application/repositories/emailConfirmationTokens"
import { InMemoryUserRepository } from "@adapters/repositories/memory/InMemoryUserRepository"
import { InMemoryEmailConfirmationTokenRepository } from "@adapters/repositories/memory/InMemoryEmailConfirmationTokenRepository"
import { PostgresUserRepository } from "@adapters/repositories/sql/PostgresUserRepository"
import { PostgresEmailConfirmationTokenRepository } from "@adapters/repositories/sql/PostgresEmailConfirmationTokenRepository"
import { getPool } from "@adapters/repositories/sql/connection"
import { RepositoryDriver } from "@express/types/repositories"

function resolveRepositoryDriver(): RepositoryDriver {
    const driver = (process.env.DATA_SOURCE ?? "memory").toLowerCase()

    if (driver === "postgres") {
        return "postgres"
    }

    return "memory"
}

function buildUserRepository(driver: RepositoryDriver): UserRepository {
    if (driver === "postgres") {
        return new PostgresUserRepository(getPool())
    }

    return new InMemoryUserRepository()
}

function buildEmailConfirmationTokenRepository(driver: RepositoryDriver): EmailConfirmationTokenRepository {
    if (driver === "postgres") {
        return new PostgresEmailConfirmationTokenRepository(getPool())
    }

    return new InMemoryEmailConfirmationTokenRepository()
}

export const repositoryDriver: RepositoryDriver = resolveRepositoryDriver()
process.stdout.write(`Repository driver: ${repositoryDriver}\n`)
export const userRepository: UserRepository = buildUserRepository(repositoryDriver)
export const emailConfirmationTokenRepository: EmailConfirmationTokenRepository = buildEmailConfirmationTokenRepository(repositoryDriver)