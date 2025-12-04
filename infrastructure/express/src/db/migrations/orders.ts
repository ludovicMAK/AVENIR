import { getPool } from "@adapters/repositories/sql/connection";
import { InfrastructureError } from "@application/errors";

export async function ensureOrdersTable(): Promise<void> {
  const client = getPool();
  try {
    await client.query(`
            CREATE TABLE IF NOT EXISTS orders (
                id UUID PRIMARY KEY,
                customer_id UUID NOT NULL,
                share_id UUID NOT NULL,
                direction VARCHAR(50) NOT NULL,
                quantity INTEGER NOT NULL,
                price_limit INTEGER NOT NULL,
                validity VARCHAR(50) NOT NULL,
                status VARCHAR(50) NOT NULL,
                date_captured TIMESTAMP NOT NULL,
                blocked_amount INTEGER NOT NULL,
                FOREIGN KEY (customer_id) REFERENCES users(id),
                FOREIGN KEY (share_id) REFERENCES shares(id)
            )
        `);

    await client.query(`
            CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id)
        `);

    await client.query(`
            CREATE INDEX IF NOT EXISTS idx_orders_share_id ON orders(share_id)
        `);

    await client.query(`
            CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)
        `);
  } catch (error) {
    console.error("Failed to ensure orders table", error);
    throw new InfrastructureError(
      "Database unavailable. Please try again later."
    );
  }
}
