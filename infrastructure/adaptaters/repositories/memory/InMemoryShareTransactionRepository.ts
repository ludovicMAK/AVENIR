import { ShareTransactionRepository } from "@application/repositories/shareTransaction";
import { ShareTransaction } from "@domain/entities/shareTransaction";

export class InMemoryShareTransactionRepository
  implements ShareTransactionRepository
{
  private transactions: Map<string, ShareTransaction> = new Map();

  async save(transaction: ShareTransaction): Promise<void> {
    this.transactions.set(transaction.id, transaction);
  }

  async findById(id: string): Promise<ShareTransaction | null> {
    return this.transactions.get(id) ?? null;
  }

  async findByShareId(shareId: string): Promise<ShareTransaction[]> {
    return Array.from(this.transactions.values())
      .filter((transaction) => transaction.shareId === shareId)
      .sort((a, b) => b.dateExecuted.getTime() - a.dateExecuted.getTime());
  }

  async findByCustomerId(customerId: string): Promise<ShareTransaction[]> {
    return Array.from(this.transactions.values())
      .filter(
        (transaction) =>
          transaction.buyerId === customerId ||
          transaction.sellerId === customerId
      )
      .sort((a, b) => b.dateExecuted.getTime() - a.dateExecuted.getTime());
  }

  async findLastByShareId(shareId: string): Promise<ShareTransaction | null> {
    const transactions = Array.from(this.transactions.values())
      .filter((transaction) => transaction.shareId === shareId)
      .sort((a, b) => b.dateExecuted.getTime() - a.dateExecuted.getTime());

    return transactions[0] ?? null;
  }
}
