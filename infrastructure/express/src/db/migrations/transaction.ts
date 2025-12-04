import { getPool } from "@adapters/repositories/sql/connection";
import { InfrastructureError } from "@application/errors";

export async function ensureTransactionsTable(): Promise<void> {
  const client = getPool();
  try {
    await client.query(`
            CREATE TYPE direction AS ENUM ('debit', 'credit');
            CREATE TYPE statust_transaction AS ENUM ('pending', 'validated', 'cancelled');
            CREATE TABLE IF NOT EXISTS transactions (
                id UUID PRIMARY KEY,
                account_IBAN UUID NOT NULL,
                direction direction NOT NULL,
                amount int NOT NULL,
                reason TEXT NOT NULL,
                account_date TIMESTAMP NOT NULL,
                status statust_transaction NOT NULL,
                transfer_id TIMESTAMP NOT NULL,
                
            )
        `);
    await client.query(`
            CREATE INDEX IF NOT EXISTS idx_transactions_transfer_id ON transactions(transfer_id)
        `);
  } catch (error) {
    console.error("Failed to ensure transactions table", error);
    throw new InfrastructureError(
      "Database unavailable. Please try again later."
    );
  }
}
