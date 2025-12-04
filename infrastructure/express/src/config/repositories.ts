import { UserRepository } from "@application/repositories/users";
import { EmailConfirmationTokenRepository } from "@application/repositories/emailConfirmationTokens";
import { AccountRepository } from "@application/repositories/account";
import { ShareRepository } from "@application/repositories/share";
import { OrderRepository } from "@application/repositories/order";
import { ShareTransactionRepository } from "@application/repositories/shareTransaction";
import { SecuritiesPositionRepository } from "@application/repositories/securitiesPosition";
import { InMemoryUserRepository } from "@adapters/repositories/memory/InMemoryUserRepository";
import { InMemoryEmailConfirmationTokenRepository } from "@adapters/repositories/memory/InMemoryEmailConfirmationTokenRepository";
import { InMemoryAccountRepository } from "@adapters/repositories/memory/InMemoryAccountRepository";
import { InMemoryShareRepository } from "@adapters/repositories/memory/InMemoryShareRepository";
import { InMemoryOrderRepository } from "@adapters/repositories/memory/InMemoryOrderRepository";
import { InMemoryShareTransactionRepository } from "@adapters/repositories/memory/InMemoryShareTransactionRepository";
import { InMemorySecuritiesPositionRepository } from "@adapters/repositories/memory/InMemorySecuritiesPositionRepository";
import { PostgresUserRepository } from "@adapters/repositories/sql/PostgresUserRepository";
import { PostgresAccountRepository } from "@adapters/repositories/sql/PostgresAccountRepository";
import { PostgresEmailConfirmationTokenRepository } from "@adapters/repositories/sql/PostgresEmailConfirmationTokenRepository";
import { PostgresShareRepository } from "@adapters/repositories/sql/PostgresShareRepository";
import { PostgresOrderRepository } from "@adapters/repositories/sql/PostgresOrderRepository";
import { PostgresShareTransactionRepository } from "@adapters/repositories/sql/PostgresShareTransactionRepository";
import { PostgresSecuritiesPositionRepository } from "@adapters/repositories/sql/PostgresSecuritiesPositionRepository";
import { getPool } from "@adapters/repositories/sql/connection";
import { RepositoryDriver } from "@express/types/repositories";

function resolveRepositoryDriver(): RepositoryDriver {
  const driver = (process.env.DATA_DRIVER ?? "memory").toLowerCase();

  if (driver === "postgres") {
    return "postgres";
  }

  return "memory";
}

function buildUserRepository(driver: RepositoryDriver): UserRepository {
  if (driver === "postgres") {
    return new PostgresUserRepository(getPool());
  }

  return new InMemoryUserRepository();
}

function buildEmailConfirmationTokenRepository(
  driver: RepositoryDriver
): EmailConfirmationTokenRepository {
  if (driver === "postgres") {
    return new PostgresEmailConfirmationTokenRepository(getPool());
  }

  return new InMemoryEmailConfirmationTokenRepository();
}
function buildAccountRepository(driver: RepositoryDriver) {
  if (driver === "postgres") {
    return new PostgresAccountRepository(getPool());
  }

  return new InMemoryAccountRepository();
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

function buildShareRepository(driver: RepositoryDriver): ShareRepository {
  if (driver === "postgres") {
    return new PostgresShareRepository(getPool());
  }

  return new InMemoryShareRepository();
}

function buildOrderRepository(driver: RepositoryDriver): OrderRepository {
  if (driver === "postgres") {
    return new PostgresOrderRepository(getPool());
  }

  return new InMemoryOrderRepository();
}

function buildShareTransactionRepository(
  driver: RepositoryDriver
): ShareTransactionRepository {
  if (driver === "postgres") {
    return new PostgresShareTransactionRepository(getPool());
  }

  return new InMemoryShareTransactionRepository();
}

function buildSecuritiesPositionRepository(
  driver: RepositoryDriver
): SecuritiesPositionRepository {
  if (driver === "postgres") {
    return new PostgresSecuritiesPositionRepository(getPool());
  }

  return new InMemorySecuritiesPositionRepository();
}

export const repositoryDriver: RepositoryDriver = resolveRepositoryDriver();
process.stdout.write(`Repository driver: ${repositoryDriver}\n`);
export const userRepository: UserRepository =
  buildUserRepository(repositoryDriver);
export const emailConfirmationTokenRepository: EmailConfirmationTokenRepository =
  buildEmailConfirmationTokenRepository(repositoryDriver);
export const accountRepository: AccountRepository =
  buildAccountRepository(repositoryDriver);
export const shareRepository: ShareRepository =
  buildShareRepository(repositoryDriver);
export const orderRepository: OrderRepository =
  buildOrderRepository(repositoryDriver);
export const shareTransactionRepository: ShareTransactionRepository =
  buildShareTransactionRepository(repositoryDriver);
export const securitiesPositionRepository: SecuritiesPositionRepository =
  buildSecuritiesPositionRepository(repositoryDriver);
