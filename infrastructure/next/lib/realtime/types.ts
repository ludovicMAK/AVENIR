import { UserRole } from "@/types/users";

export type RealtimeMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole?: UserRole;
  text: string;
  sendDate: string | Date;
};

export type ConversationCreatedEvent = {
  id: string;
  subject: string;
  status: string;
  type: string;
  dateOuverture: string;
  customerId: string | null;
};

export type ConversationClosedEvent = {
  conversationId: string;
};

export type ConversationTransferredEvent = {
  conversationId: string;
  fromAdvisorId: string;
  toAdvisorId: string;
};

export type SocketErrorEvent = {
  error: string;
};
