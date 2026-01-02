import { Message } from "@domain/entities/message";
import { Conversation } from "@domain/entities/conversation";

export interface WebSocketService {
  // Emit a new message to all participants in a conversation
  emitNewMessage(conversationId: string, message: Message): Promise<void>;

  // Emit conversation created event
  emitConversationCreated(conversation: Conversation): Promise<void>;

  // Emit conversation closed event
  emitConversationClosed(conversationId: string): Promise<void>;

  // Emit conversation transferred event
  emitConversationTransferred(
    conversationId: string,
    fromAdvisorId: string,
    toAdvisorId: string
  ): Promise<void>;

  // Join a user to a conversation room
  joinConversationRoom(userId: string, conversationId: string): Promise<void>;

  // Leave a conversation room
  leaveConversationRoom(userId: string, conversationId: string): Promise<void>;
}
