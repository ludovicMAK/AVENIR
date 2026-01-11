import { TransferRepository } from "@application/repositories/transfer";

export class GetTransferHistory {
  constructor(private readonly transferRepository: TransferRepository) {}

  async execute(): Promise<any[]> {
    return await this.transferRepository.getHistory();
  }
}
