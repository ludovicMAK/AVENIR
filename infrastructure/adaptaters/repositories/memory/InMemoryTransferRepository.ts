import { TransferRepository } from "@application/repositories/transfer";
import { Transfer } from "@domain/entities/transfer";
import { UnitOfWork } from "@application/services/UnitOfWork";
import { InMemoryUnitOfWork } from "@adapters/services/InMemoryUnitOfWork";

export class InMemoryTransferRepository implements TransferRepository {
  private readonly items: Map<string, Transfer> = new Map();

  async save(transfer: Transfer, unitOfWork?: UnitOfWork): Promise<boolean> {
    if (unitOfWork instanceof InMemoryUnitOfWork) {
      unitOfWork.registerChange({
        execute: async () => {
          this.items.set(transfer.id, transfer);
        },
      });
    } else {
      this.items.set(transfer.id, transfer);
    }
    return true;
  }
  async findById(transferId: string): Promise<Transfer | null> {
    const transfer = this.items.get(transferId);
    return transfer || null;
  }
  async update(transfer: Transfer, unitOfWork?: UnitOfWork): Promise<boolean> {
    if (unitOfWork instanceof InMemoryUnitOfWork) {
      unitOfWork.registerChange({
        execute: async () => {
          this.items.set(transfer.id, transfer);
        },
      });
    } else {
      this.items.set(transfer.id, transfer);
    }
    return true;
  }

  getAll(): Transfer[] {
    return Array.from(this.items.values());
  }

  async getHistory(): Promise<any[]> {
    const transfers = Array.from(this.items.values());
    return transfers.map((transfer) => ({
      id: transfer.id,
      amount: transfer.amount,
      dateRequested: transfer.dateRequested,
      dateExecuted: transfer.dateExecuted,
      description: transfer.description,
      status: transfer.statusTransfer.getValue(),
    }));
  }

  clear(): void {
    this.items.clear();
  }
}
