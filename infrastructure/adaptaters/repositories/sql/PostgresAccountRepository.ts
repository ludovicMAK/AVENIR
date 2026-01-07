import { Pool } from "pg";

import { AccountRepository } from "@application/repositories/account";
import { InfrastructureError } from "@application/errors";
import { ensureError } from "@application/utils/errors";
import { Account } from "@domain/entities/account";
import { AccountRow } from "../types/AccountRow";
import { AccountType } from "@domain/values/accountType";
import { StatusAccount } from "@domain/values/statusAccount";
import { UnitOfWork } from "@application/services/UnitOfWork";
import { PostgresUnitOfWork } from "@adapters/services/PostgresUnitOfWork";

export class PostgresAccountRepository implements AccountRepository {
  constructor(private readonly pool: Pool) {}

  async save(account: Account): Promise<void> {
    try {
      await this.pool.query(
        `
                    INSERT INTO accounts (id, iban, account_type, account_name, authorized_overdraft, overdraft_limit, overdraft_fees, status, balance, id_owner, available_balance)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                `,
        [
          account.id,
          account.IBAN,
          account.accountType.getValue(),
          account.accountName,
          account.authorizedOverdraft,
          account.overdraftLimit,
          account.overdraftFees,
          account.status.getValue(),
          account.balance,
          account.idOwner,
          account.availableBalance,
        ]
      );
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async findById(id: string): Promise<Account | null> {
    try {
      const result = await this.pool.query<AccountRow>(
        `
                SELECT id, iban, account_type, account_name, authorized_overdraft, overdraft_limit, overdraft_fees, status, balance, id_owner, available_balance
                FROM accounts
                WHERE id = $1
                `,
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return this.mapRowToAccount(row);
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async findByIBAN(IBAN: string): Promise<Account | null> {
    try {
      const result = await this.pool.query<AccountRow>(
        `
                    SELECT id, iban, account_type, account_name, authorized_overdraft, overdraft_limit, overdraft_fees, status, balance, id_owner, available_balance
                    FROM accounts
                    WHERE iban = $1
                `,
        [IBAN]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return this.mapRowToAccount(row);
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async findByOwnerId(ownerId: string): Promise<Account[]> {
    try {
      const result = await this.pool.query<AccountRow>(
        `
                SELECT id, iban, account_type, account_name, authorized_overdraft, overdraft_limit, overdraft_fees, status, balance, id_owner, available_balance
                FROM accounts
                WHERE id_owner = $1
                `,
        [ownerId]
      );

      return result.rows.map((row) => this.mapRowToAccount(row));
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async updateBalance(
    accountId: string,
    amountToAdd: number,
    unitOfWork?: UnitOfWork
  ): Promise<void> {
    try {
      const client =
        unitOfWork instanceof PostgresUnitOfWork
          ? unitOfWork.getClient()
          : null;
      const query = `
                UPDATE accounts
        SET balance = balance + $1
        WHERE id = $2 AND status = 'open'
            `;

      const params = [amountToAdd, accountId];

      if (client) {
        await client.query(query, params);
      } else {
        await this.pool.query(query, params);
      }
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }
  async findByIdAndUserId(id: string, userId: string): Promise<Account | null> {
    try {
      const result = await this.pool.query<AccountRow>(
        `
                    SELECT id, iban, account_type, account_name, authorized_overdraft, overdraft_limit, overdraft_fees, status, balance, id_owner, available_balance
                    FROM accounts
                    WHERE id = $1 AND id_owner = $2
                `,
        [id, userId]
      );
      if (result.rows.length === 0) {
        return null;
      }
      const row = result.rows[0];
      return this.mapRowToAccount(row);
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async updateStatus(accountId: string, status: string): Promise<void> {
    try {
      await this.pool.query(
        `
                    UPDATE accounts
                    SET status = $1
                    WHERE id = $2
                `,
        [status, accountId]
      );
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async delete(accountId: string): Promise<void> {
    try {
      await this.pool.query(
        `
                    DELETE FROM accounts
                    WHERE id = $1
                `,
        [accountId]
      );
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }
  async updateNameAccount(
    accountId: string,
    newName: string
  ): Promise<boolean> {
    try {
      const result = await this.pool.query(
        `UPDATE accounts 
       SET account_name = $1 
       WHERE id = $2 AND status != 'CLOSED'`,
        [newName, accountId]
      );

      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      return this.handleDatabaseError(error);
    }
  }
  async updateBalanceAvailable(
    accountId: string,
    amountToAdd: number,
    unitOfWork?: UnitOfWork
  ): Promise<void> {
    try {
      const client =
        unitOfWork instanceof PostgresUnitOfWork
          ? unitOfWork.getClient()
          : null;
      const query = `
                  UPDATE accounts
          SET available_balance = available_balance + $1
          WHERE id = $2 AND status = 'open'
              `;
      const params = [amountToAdd, accountId];
      if (client) {
        await client.query(query, params);
      } else {
        await this.pool.query(query, params);
      }
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async blockFunds(
    accountId: string,
    amount: number,
    unitOfWork?: UnitOfWork
  ): Promise<void> {
    try {
      const client =
        unitOfWork instanceof PostgresUnitOfWork
          ? unitOfWork.getClient()
          : null;
      const query = `
        UPDATE accounts
        SET available_balance = available_balance - $1
        WHERE id = $2 AND status = 'open'
      `;
      const params = [amount, accountId];
      if (client) {
        await client.query(query, params);
      } else {
        await this.pool.query(query, params);
      }
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async unblockFunds(
    accountId: string,
    amount: number,
    unitOfWork?: UnitOfWork
  ): Promise<void> {
    try {
      const client =
        unitOfWork instanceof PostgresUnitOfWork
          ? unitOfWork.getClient()
          : null;
      const query = `
        UPDATE accounts
        SET available_balance = available_balance + $1
        WHERE id = $2 AND status = 'open'
      `;
      const params = [amount, accountId];
      if (client) {
        await client.query(query, params);
      } else {
        await this.pool.query(query, params);
      }
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }
  async findCurrentAccountByCustomerId(customerId: string): Promise<Account | null> {
    try {
      const result = await this.pool.query<AccountRow>(
        `
          SELECT id, IBAN, account_type, account_name, authorized_overdraft, overdraft_limit, overdraft_fees, status, balance, id_owner, available_balance
          FROM accounts
          WHERE id_owner = $1 AND account_type = 'current'
        `,
        [customerId]
      );
      if (result.rows.length === 0) {
        return null;
      }
      const row = result.rows[0];
      return this.mapRowToAccount(row);
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  private mapRowToAccount(row: AccountRow): Account {
    return new Account(
      row.id,
      AccountType.from(row.account_type),
      row.iban,
      row.account_name,
      row.authorized_overdraft,
      parseInt(row.overdraft_limit.toString(), 10),
      parseInt(row.overdraft_fees.toString(), 10),
      StatusAccount.from(row.status),
      row.id_owner,
      parseInt(row.balance.toString(), 10),
      parseInt(row.available_balance.toString(), 10)
    );
  }

  private handleDatabaseError(unknownError: unknown): never {
    const error = ensureError(unknownError, "Unexpected database error");
    console.error("Database operation failed", error);
    throw new InfrastructureError(
      "Database unavailable. Please try again later."
    );
  }
}
