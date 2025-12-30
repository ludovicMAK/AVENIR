import { Pool } from "pg";

import { AccountRepository } from "@application/repositories/account";
import { InfrastructureError } from "@application/errors";
import { ensureError } from "@application/utils/errors";
import { Account } from "@domain/entities/account";
import { AccountRow } from "../types/AccountRow";
import { AccountType } from "@domain/values/accountType";
import { StatusAccount } from "@domain/values/statusAccount";

export class PostgresAccountRepository implements AccountRepository {
  constructor(private readonly pool: Pool) {}

  async save(account: Account): Promise<void> {
    try {
      await this.pool.query(
        `
                    INSERT INTO accounts (id, IBAN, account_type, account_name, authorized_overdraft, overdraft_limit, overdraft_fees, status, balance, id_owner)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
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
                    SELECT id, IBAN, account_type, account_name, authorized_overdraft, overdraft_limit, overdraft_fees, status, balance, id_owner
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
                    SELECT id, IBAN, account_type, account_name, authorized_overdraft, overdraft_limit, overdraft_fees, status, balance, id_owner
                    FROM accounts
                    WHERE IBAN = $1
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
                    SELECT id, IBAN, account_type, account_name, authorized_overdraft, overdraft_limit, overdraft_fees, status, balance, id_owner
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

  async updateBalance(accountId: string, newBalance: number): Promise<void> {
    try {
      await this.pool.query(
        `
                    UPDATE accounts
                    SET balance = $1
                    WHERE id = $2
                `,
        [newBalance, accountId]
      );
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }
  async findByIdAndUserId(id: string, userId: string): Promise<Account | null> {
    try {
      const result = await this.pool.query<AccountRow>(
        `
                    SELECT id, IBAN, account_type, account_name, authorized_overdraft, overdraft_limit, overdraft_fees, status, balance, id_owner
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
  async updateNameAccount(accountId: string, newName: string): Promise<boolean> {
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

  private mapRowToAccount(row: AccountRow): Account {
    return new Account(
      row.id,
      AccountType.from(row.account_type),
      row.IBAN,
      row.account_name,
      row.authorized_overdraft,
      parseFloat(row.overdraft_limit.toString()),
      parseFloat(row.overdraft_fees.toString()),
      StatusAccount.from(row.status),
      row.id_owner,
      parseFloat(row.balance.toString())
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
