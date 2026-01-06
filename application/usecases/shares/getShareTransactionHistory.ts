import { ShareTransactionRepository } from "@application/repositories/shareTransaction";
import { ShareRepository } from "@application/repositories/share";
import { GetShareTransactionHistoryInput } from "@application/requests/shares";
import { ShareTransaction } from "@domain/entities/shareTransaction";
import { NotFoundError } from "@application/errors";

export class GetShareTransactionHistory {
  constructor(
    private readonly shareTransactionRepository: ShareTransactionRepository,
    private readonly shareRepository: ShareRepository
  ) {}

  async execute(
    input: GetShareTransactionHistoryInput
  ): Promise<ShareTransaction[]> {
    const share = await this.shareRepository.findById(input.shareId);

    if (!share) {
      throw new NotFoundError("Share not found");
    }

    const transactions = await this.shareTransactionRepository.findByShareId(
      input.shareId
    );

    // Trier par date décroissante (plus récent en premier)
    return transactions.sort(
      (a, b) => b.dateExecuted.getTime() - a.dateExecuted.getTime()
    );
  }
}
