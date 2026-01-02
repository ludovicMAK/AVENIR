import { MessageRepository } from "@application/repositories/message";
import { Message } from "@domain/entities/message";

export class InMemoryMessageRepository implements MessageRepository {
  private readonly items: Map<string, Message> = new Map();

  async save(message: Message): Promise<void> {
    this.items.set(message.id, message);
  }

  async findById(id: string): Promise<Message | null> {
    return this.items.get(id) || null;
  }

  async findByConversationId(conversationId: string): Promise<Message[]> {
    return Array.from(this.items.values()).filter(
      (message) => message.conversationId === conversationId
    );
  }

  async findBySenderId(senderId: string): Promise<Message[]> {
    return Array.from(this.items.values()).filter(
      (message) => message.senderId === senderId
    );
  }

  async findByConversationIdOrderByDate(
    conversationId: string
  ): Promise<Message[]> {
    return Array.from(this.items.values())
      .filter((message) => message.conversationId === conversationId)
      .sort((a, b) => a.sendDate.getTime() - b.sendDate.getTime());
  }

  async delete(messageId: string): Promise<void> {
    this.items.delete(messageId);
  }
}
