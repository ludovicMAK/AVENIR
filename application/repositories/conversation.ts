import { Conversation } from "@domain/entities/conversation";
import { ConversationStatus } from "@domain/values/conversationStatus";

export interface ConversationRepository {
  save(conversation: Conversation): Promise<void>;
  findById(id: string): Promise<Conversation | null>;
  findByCustomerId(customerId: string): Promise<Conversation[]>;
  findByStatus(status: ConversationStatus): Promise<Conversation[]>;
  updateSubject(conversationId: string, subject: string): Promise<void>;
  updateStatus(
    conversationId: string,
    status: ConversationStatus
  ): Promise<void>;
  delete(conversationId: string): Promise<void>;
}
