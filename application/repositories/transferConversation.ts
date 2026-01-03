import { TransferConversation } from "@domain/entities/transferConversation";

export interface TransferConversationRepository {
  save(transfer: TransferConversation): Promise<void>;
  findById(id: string): Promise<TransferConversation | null>;
  findByConversationId(conversationId: string): Promise<TransferConversation[]>;
  findByFromAdvisorId(fromAdvisorId: string): Promise<TransferConversation[]>;
  findByToAdvisorId(toAdvisorId: string): Promise<TransferConversation[]>;
  findByConversationIdOrderByDate(
    conversationId: string
  ): Promise<TransferConversation[]>;
  delete(transferId: string): Promise<void>;
}
