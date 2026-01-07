import { ShareTransactionRepository } from "@application/repositories/shareTransaction";
import { ShareTransaction } from "@domain/entities/shareTransaction";

export class GetShareTransactionHistory {
  constructor(
    private readonly shareTransactionRepository: ShareTransactionRepository
  ) {}

  async execute(shareId: string): Promise<ShareTransaction[]> {
    const transactions = await this.shareTransactionRepository.findByShareId(
      shareId
    );

    // Les transactions sont déjà triées par date décroissante dans le repository
    return transactions;
  }
}
