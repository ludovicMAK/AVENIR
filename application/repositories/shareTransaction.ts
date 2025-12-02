import { ShareTransaction } from "@domain/entities/shareTransaction";

export interface ShareTransactionRepository {
  save(transaction: ShareTransaction): Promise<void>;
  findById(id: string): Promise<ShareTransaction | null>;
  findByShareId(shareId: string): Promise<ShareTransaction[]>;
  findByCustomerId(customerId: string): Promise<ShareTransaction[]>;
  findLastByShareId(shareId: string): Promise<ShareTransaction | null>;
}
