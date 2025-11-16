import { UserRepository } from "@application/repositories/users"
import { InMemoryUserRepository } from "@adapters/repositories/memory/InMemoryUserRepository"
import { PostgresUserRepository } from "@adapters/repositories/sql/PostgresUserRepository"
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

export const repositoryDriver: RepositoryDriver = resolveRepositoryDriver()
process.stdout.write(`Repository driver: ${repositoryDriver}\n`)
export const userRepository: UserRepository = buildUserRepository(repositoryDriver)