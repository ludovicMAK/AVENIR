import { Transfer } from "@domain/entities/transfer";
import { UnitOfWork } from "@application/services/UnitOfWork";
import { TransferHistoryItem } from "@application/usecases/transfer/getTransferHistory";

export interface TransferRepository {
  save(transfer: Transfer, unitOfWork?: UnitOfWork): Promise<boolean>;
  findById(
    transferId: string,
    unitOfWork?: UnitOfWork
  ): Promise<Transfer | null>;
  update(transfer: Transfer, unitOfWork?: UnitOfWork): Promise<boolean>;
  getHistory(): Promise<TransferHistoryItem[]>;
}
