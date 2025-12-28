import { TransferRepository } from "@application/repositories/transfer";
import { Transfer } from "@domain/entities/transfer";

export class InMemoryTransferRepository implements TransferRepository {
    private readonly items: Map<string, Transfer> = new Map()

    async save(transfer: Transfer): Promise<boolean> {
        this.items.set(transfer.id, transfer);
        console.log("Transfer saved in memory:", this.items);
        return true;
    }
}