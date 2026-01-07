import { Pool } from "pg"
import { TransferRepository } from "@application/repositories/transfer"
import { Transfer } from "@domain/entities/transfer"
import { UnitOfWork } from "@application/services/UnitOfWork"
import { PostgresUnitOfWork } from "@adapters/services/PostgresUnitOfWork";
import { StatusTransfer } from "@domain/values/statusTransfer";

export class PostgresTransferRepository implements TransferRepository {
    constructor(private readonly pool: Pool) {}

    async save(transfer: Transfer, unitOfWork?: UnitOfWork): Promise<boolean> { 
        try {
            const client = unitOfWork instanceof PostgresUnitOfWork
                ? unitOfWork.getClient()
                : null;

            const query = `
                INSERT INTO transfers (id, amount, date_requested, date_executed, description, status)
                VALUES ($1, $2, $3, $4, $5, $6)
            `;
            
            const params = [
                transfer.id,
                transfer.amount,
                transfer.dateRequested,
                transfer.dateExecuted,
                transfer.description,
                transfer.statusTransfer.getValue(),
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
    async findById(transferId: string): Promise<Transfer | null> {
        try {
            const result = await this.pool.query(
                `
                    SELECT id, amount, date_requested, date_executed, description, status
                    FROM transfers
                    WHERE id = $1
                    LIMIT 1
                `,
                [transferId]
            );

            if (result.rows.length === 0) {
                return null;
            }

            const row = result.rows[0];
            return new Transfer(
                row.id,
                row.amount,
                row.date_requested,
                row.date_executed,
                row.description,
                StatusTransfer.from(row.status)
            );
        } catch (error) {
            console.error("Database operation failed", error);
            return null;
        }
    }
    async update(transfer: Transfer, unitOfWork?: UnitOfWork): Promise<boolean> {
        try {
            const client = unitOfWork instanceof PostgresUnitOfWork
                ? unitOfWork.getClient()
                : null;

            const query = `
                UPDATE transfers
                SET amount = $2, date_requested = $3, date_executed = $4, description = $5, status = $6
                WHERE id = $1
            `;
            
            const params = [
                transfer.id,
                transfer.amount,
                transfer.dateRequested,
                transfer.dateExecuted,
                transfer.description,
                transfer.statusTransfer.getValue(),
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