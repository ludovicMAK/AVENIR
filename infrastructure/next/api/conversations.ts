import { request } from "./client";
import { ApiError } from "@/lib/errors";
import { isJsonObject } from "@/lib/json";

export interface Conversation {
  id: string;
  subject: string;
  status: string;
  createdAt: string;
  closedAt?: string;
  customerId: string;
  assignedAdvisorId?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName?: string;
  content: string;
  sentAt: string;
}

export interface CreateConversationRequest {
  subject: string;
  initialMessage: string;
}

export interface SendMessageRequest {
  conversationId: string;
  content: string;
}

export interface TransferConversationRequest {
  conversationId: string;
  newAdvisorId: string;
}

function parseConversation(data: any): Conversation {
  return {
    id: data.id || '',
    subject: data.subject || 'Conversation',
    status: data.status || 'open',
    createdAt: data.createdAt || data.dateOuverture || new Date().toISOString(),
    closedAt: data.closedAt || data.dateFermeture,
    customerId: data.customerId || '',
    assignedAdvisorId: data.assignedAdvisorId,
  };
}

export const conversationsApi = {
  async getMyConversations(): Promise<Conversation[]> {
    const response = await request("/customers/me/conversations");
    if (!isJsonObject(response) || !Array.isArray(response.conversations)) {
      throw new ApiError(
        "INFRASTRUCTURE_ERROR",
        "Invalid conversations response"
      );
    }
    return response.conversations.map(parseConversation);
  },

  async getAdvisorConversations(advisorId: string): Promise<Conversation[]> {
    const response = await request(`/advisors/${advisorId}/conversations`);
    if (!isJsonObject(response) || !Array.isArray(response.conversations)) {
      throw new ApiError(
        "INFRASTRUCTURE_ERROR",
        "Invalid conversations response"
      );
    }
    return response.conversations.map(parseConversation);
  },

  async getMessages(conversationId: string): Promise<Message[]> {
    const response = await request(`/conversations/${conversationId}/messages`);
    if (!isJsonObject(response) || !Array.isArray(response.messages)) {
      throw new ApiError("INFRASTRUCTURE_ERROR", "Invalid messages response");
    }
    return response.messages as unknown as Message[];
  },

  async createConversation(
    data: CreateConversationRequest
  ): Promise<{ conversationId: string }> {
    const response = await request("/conversations", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!isJsonObject(response) || !isJsonObject(response.conversation)) {
      throw new ApiError(
        "INFRASTRUCTURE_ERROR",
        "Invalid create conversation response"
      );
    }
    return {
      conversationId: (response.conversation as { id: string }).id,
    };
  },

  async sendMessage(data: SendMessageRequest): Promise<{ messageId: string }> {
    const response = await request("/conversations/messages", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!isJsonObject(response) || !isJsonObject(response.message)) {
      throw new ApiError(
        "INFRASTRUCTURE_ERROR",
        "Invalid send message response"
      );
    }
    return { messageId: (response.message as { id: string }).id };
  },

  async closeConversation(conversationId: string): Promise<void> {
    await request(`/conversations/${conversationId}/close`, {
      method: "PATCH",
    });
  },

  async transferConversation(
    data: TransferConversationRequest
  ): Promise<void> {
    await request("/conversations/transfer", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
