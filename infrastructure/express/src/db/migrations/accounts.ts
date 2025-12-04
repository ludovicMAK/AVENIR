import { getPool } from "@adapters/repositories/sql/connection";
import { InfrastructureError } from "@application/errors";

export async function ensureAccountsTable(): Promise<void> {
  const client = getPool();
  try {
    await client.query(`
            CREATE TABLE IF NOT EXISTS accounts (
                IBAN VARCHAR(34) PRIMARY KEY,
                account_type VARCHAR(50) NOT NULL,
                account_name VARCHAR(255) NOT NULL,
                authorized_overdraft BOOLEAN NOT NULL DEFAULT false,
                status VARCHAR(50) NOT NULL,
                id_owner UUID NOT NULL,
                FOREIGN KEY (id_owner) REFERENCES users(id)
            )
        `);

    await client.query(`
            CREATE INDEX IF NOT EXISTS idx_accounts_id_owner ON accounts(id_owner)
        `);
  } catch (error) {
    console.error("Failed to ensure accounts table", error);
    throw new InfrastructureError(
      "Database unavailable. Please try again later."
    );
  }
}
