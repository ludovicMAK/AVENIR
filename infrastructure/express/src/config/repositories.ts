import { UserRepository } from "@application/repositories/users"
import { EmailConfirmationTokenRepository } from "@application/repositories/emailConfirmationTokens"
import { InMemoryUserRepository } from "@adapters/repositories/memory/InMemoryUserRepository"
import { InMemoryEmailConfirmationTokenRepository } from "@adapters/repositories/memory/InMemoryEmailConfirmationTokenRepository"

import { PostgresUserRepository } from "@adapters/repositories/sql/PostgresUserRepository"
import { PostgresAccountRepository } from "@adapters/repositories/sql/PostgresAccountRepository"
import { PostgresEmailConfirmationTokenRepository } from "@adapters/repositories/sql/PostgresEmailConfirmationTokenRepository"
import { PostgresTransactionRepository } from "@adapters/repositories/sql/PostgresTransactionRepository"
import { getPool } from "@adapters/repositories/sql/connection"
import { RepositoryDriver } from "@express/types/repositories"
import { InMemoryAccountRepository } from "@adapters/repositories/memory/InMemoryAccountRepository"
import { AccountRepository } from "@application/repositories/account"
import { TransactionRepository } from "@application/repositories/transaction"
import { InMemoryTransactionRepository } from "@adapters/repositories/memory/InMemoryTransactionRepository"
import { TransferRepository } from "@application/repositories/transfer"
import { PostgresTransferRepository } from "@adapters/repositories/sql/PostgresTransferRepository"
import { InMemoryTransferRepository } from "@adapters/repositories/memory/InMemoryTransferRepository"

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
function buildAccountRepository(driver: RepositoryDriver) {
    if (driver === "postgres") {
        return new PostgresAccountRepository(getPool())
    }

    return new InMemoryAccountRepository()
}
function buildTransactionRepository(driver: RepositoryDriver): TransactionRepository {
    if (driver === "postgres") {
        return new PostgresTransactionRepository(getPool())
    }

    return new InMemoryTransactionRepository()
}
function buildTransferRepository(driver: RepositoryDriver) : TransferRepository {
    if (driver === "postgres") {
        return new PostgresTransferRepository(getPool())
    }

    return new InMemoryTransferRepository()
}

export const repositoryDriver: RepositoryDriver = resolveRepositoryDriver()
process.stdout.write(`Repository driver: ${repositoryDriver}\n`)
export const userRepository: UserRepository = buildUserRepository(repositoryDriver)
export const emailConfirmationTokenRepository: EmailConfirmationTokenRepository = buildEmailConfirmationTokenRepository(repositoryDriver)
export const accountRepository: AccountRepository = buildAccountRepository(repositoryDriver)
export const transactionRepository: TransactionRepository = buildTransactionRepository(repositoryDriver)
export const transferRepository: TransferRepository = buildTransferRepository(repositoryDriver)