import { Message } from "@domain/entities/message";

export interface MessageRepository {
  save(message: Message): Promise<void>;
  findById(id: string): Promise<Message | null>;
  findByConversationId(conversationId: string): Promise<Message[]>;
  findBySenderId(senderId: string): Promise<Message[]>;
  findByConversationIdOrderByDate(conversationId: string): Promise<Message[]>;
  delete(messageId: string): Promise<void>;
}
