export type CreateConversationRequest = {
  token: string;
  customerId: string;
  initialMessage: string;
  assignedAdvisorId?: string;
  type?: "private";
};

export type CreateGroupConversationRequest = {
  token: string;
  creatorId: string;
  subject?: string;
  initialMessage: string;
};

export type SendMessageRequest = {
  token: string;
  conversationId: string;
  senderId: string;
  text: string;
};

export type TransferConversationRequest = {
  token: string;
  conversationId: string;
  fromAdvisorId: string;
  toAdvisorId: string;
  reason: string;
};

export type CloseConversationRequest = {
  token: string;
  conversationId: string;
  userId: string;
};

export type GetConversationMessagesRequest = {
  token: string;
  conversationId: string;
  userId: string;
};

export type GetCustomerConversationsRequest = {
  token: string;
  customerId: string;
};

export type GetAdvisorConversationsRequest = {
  token: string;
  advisorId: string;
};

export type GetConversationParticipantsRequest = {
  token: string;
  conversationId: string;
  userId: string;
};
