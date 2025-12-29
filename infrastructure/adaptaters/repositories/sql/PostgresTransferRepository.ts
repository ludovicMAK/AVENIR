import { Pool } from "pg"
import { TransferRepository } from "@application/repositories/transfer"
import { Transfer } from "@domain/entities/transfer"
import { UnitOfWork } from "@application/services/UnitOfWork"
import { PostgresUnitOfWork } from "@adapters/services/PostgresUnitOfWork";

export class PostgresTransferRepository implements TransferRepository {
    constructor(private readonly pool: Pool) {}

    async save(transfer: Transfer, unitOfWork?: UnitOfWork): Promise<boolean> { 
        try {
            const client = unitOfWork instanceof PostgresUnitOfWork
                ? unitOfWork.getClient()
                : null;

            const query = `
                INSERT INTO transfer (id, amount, date_requested, date_executed, description)
                VALUES ($1, $2, $3, $4, $5)
            `;
            
            const params = [
                transfer.id,
                transfer.amount,
                transfer.dateRequested,
                transfer.dateExecuted,
                transfer.description,
            ];

            const result = client
                ? await client.query(query, params)
                : await this.pool.query(query, params);
            
            return result.rowCount === 1; 
            
        } catch (error) {
            console.error("Database operation failed", error);
            return false;
        }
    }
}