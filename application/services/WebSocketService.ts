import { Message } from "@domain/entities/message";
import { Conversation } from "@domain/entities/conversation";

export interface WebSocketService {
  emitNewMessage(conversationId: string, message: Message): Promise<void>;

  emitConversationCreated(conversation: Conversation): Promise<void>;

  emitConversationClosed(conversationId: string): Promise<void>;

  emitConversationTransferred(
    conversationId: string,
    fromAdvisorId: string,
    toAdvisorId: string
  ): Promise<void>;

  joinConversationRoom(userId: string, conversationId: string): Promise<void>;

  leaveConversationRoom(userId: string, conversationId: string): Promise<void>;
}
