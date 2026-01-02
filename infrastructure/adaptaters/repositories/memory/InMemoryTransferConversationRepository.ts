import { TransferConversationRepository } from "@application/repositories/transferConversation";
import { TransferConversation } from "@domain/entities/transferConversation";

export class InMemoryTransferConversationRepository
  implements TransferConversationRepository
{
  private readonly items: Map<string, TransferConversation> = new Map();

  async save(transfer: TransferConversation): Promise<void> {
    this.items.set(transfer.id, transfer);
  }

  async findById(id: string): Promise<TransferConversation | null> {
    return this.items.get(id) || null;
  }

  async findByConversationId(
    conversationId: string
  ): Promise<TransferConversation[]> {
    return Array.from(this.items.values()).filter(
      (transfer) => transfer.conversationId === conversationId
    );
  }

  async findByFromAdvisorId(
    fromAdvisorId: string
  ): Promise<TransferConversation[]> {
    return Array.from(this.items.values()).filter(
      (transfer) => transfer.fromAdvisorId === fromAdvisorId
    );
  }

  async findByToAdvisorId(
    toAdvisorId: string
  ): Promise<TransferConversation[]> {
    return Array.from(this.items.values()).filter(
      (transfer) => transfer.toAdvisorId === toAdvisorId
    );
  }

  async findByConversationIdOrderByDate(
    conversationId: string
  ): Promise<TransferConversation[]> {
    return Array.from(this.items.values())
      .filter((transfer) => transfer.conversationId === conversationId)
      .sort((a, b) => a.transferDate.getTime() - b.transferDate.getTime());
  }

  async delete(transferId: string): Promise<void> {
    this.items.delete(transferId);
  }
}
