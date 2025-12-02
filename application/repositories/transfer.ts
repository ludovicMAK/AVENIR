import { Transfer } from "@domain/entities/transfer"
export interface TransferRepository {
    save(transfer: Transfer): Promise<Transfer | void>
}