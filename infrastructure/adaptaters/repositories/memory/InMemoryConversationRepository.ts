import { ConversationRepository } from "@application/repositories/conversation";
import { Conversation } from "@domain/entities/conversation";
import { ConversationStatus } from "@domain/values/conversationStatus";

export class InMemoryConversationRepository implements ConversationRepository {
  private readonly items: Map<string, Conversation> = new Map();

  async save(conversation: Conversation): Promise<void> {
    this.items.set(conversation.id, conversation);
  }

  async findById(id: string): Promise<Conversation | null> {
    return this.items.get(id) || null;
  }

  async findByCustomerId(customerId: string): Promise<Conversation[]> {
    return Array.from(this.items.values()).filter(
      (conversation) => conversation.customerId === customerId
    );
  }

  async findByStatus(status: ConversationStatus): Promise<Conversation[]> {
    return Array.from(this.items.values()).filter((conversation) =>
      conversation.status.equals(status)
    );
  }

  async updateStatus(
    conversationId: string,
    status: ConversationStatus
  ): Promise<void> {
    const conversation = this.items.get(conversationId);
    if (conversation) {
      const updated = new Conversation(
        conversation.id,
        conversation.subject,
        status,
        conversation.type,
        conversation.dateOuverture,
        conversation.customerId
      );
      this.items.set(conversationId, updated);
    }
  }

  async updateSubject(conversationId: string, subject: string): Promise<void> {
    const conversation = this.items.get(conversationId);
    if (conversation) {
      const updated = new Conversation(
        conversation.id,
        subject,
        conversation.status,
        conversation.type,
        conversation.dateOuverture,
        conversation.customerId
      );
      this.items.set(conversationId, updated);
    }
  }

  async delete(conversationId: string): Promise<void> {
    this.items.delete(conversationId);
  }
}
