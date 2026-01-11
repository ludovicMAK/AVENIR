import { TransferRepository } from "@application/repositories/transfer";

export interface TransferHistoryItem {
  id: string;
  amount: number;
  dateRequested: Date;
  dateExecuted: Date | null;
  description: string;
  status: string;
}

export class GetTransferHistory {
  constructor(private readonly transferRepository: TransferRepository) {}

  async execute(): Promise<TransferHistoryItem[]> {
    return await this.transferRepository.getHistory();
  }
}
