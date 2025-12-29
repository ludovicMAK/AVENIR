import { Pool, PoolClient } from "pg";
import { UnitOfWork } from "@application/services/UnitOfWork";


export class PostgresUnitOfWork implements UnitOfWork {
  private client: PoolClient | null = null;
  private isActive: boolean = false;

  constructor(private readonly pool: Pool) {}


  async begin(): Promise<void> {
    this.client = await this.pool.connect();
    await this.client.query("BEGIN");
    this.isActive = true;
  }

  async commit(): Promise<void> {
    if (!this.client || !this.isActive) {
      throw new Error("No active transaction");
    }

    try {
      await this.client.query("COMMIT");
      this.isActive = false;
    } finally {
      this.client.release();
      this.client = null;
    }
  }


  async rollback(): Promise<void> {
    if (!this.client) {
      return;
    }

    try {
      if (this.isActive) {
        await this.client.query("ROLLBACK");
      }
    } finally {
      this.isActive = false;
      this.client.release();
      this.client = null;
    }
  }

 
  getClient(): PoolClient {
    if (!this.client || !this.isActive) {
      throw new Error("UnitOfWork is not active. Call begin() first.");
    }
    return this.client;
  }


  isTransactionActive(): boolean {
    return this.isActive && this.client !== null;
  }
}
