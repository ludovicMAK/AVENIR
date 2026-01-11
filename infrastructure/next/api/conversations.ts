import { request } from "./client";
import { ApiError } from "@/lib/errors";
import { isJsonObject } from "@/lib/json";
import { JsonObject } from "@/types/json";

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

function parseConversation(data: JsonObject): Conversation {
  return {
    id: String(data.id ?? ""),
    subject: String(data.subject ?? "Conversation"),
    status: String(data.status ?? "open"),
    createdAt:
      String(data.createdAt ?? data.dateOuverture ?? new Date().toISOString()),
    closedAt:
      data.closedAt !== undefined && data.closedAt !== null
        ? String(data.closedAt)
        : data.dateFermeture
        ? String(data.dateFermeture)
        : undefined,
    customerId: String(data.customerId ?? ""),
    assignedAdvisorId:
      data.assignedAdvisorId !== undefined && data.assignedAdvisorId !== null
        ? String(data.assignedAdvisorId)
        : undefined,
  };
}

function parseMessage(data: JsonObject): Message {
  return {
    id: String(data.id ?? ""),
    conversationId: String(data.conversationId ?? data.conversation_id ?? ""),
    senderId: String(data.senderId ?? ""),
    senderName:
      data.senderName !== undefined && data.senderName !== null
        ? String(data.senderName)
        : undefined,
    content: String(data.content ?? ""),
    sentAt: String(data.sentAt ?? data.sendDate ?? new Date().toISOString()),
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
    const conversations = response.conversations.filter(isJsonObject);
    if (conversations.length !== response.conversations.length) {
      throw new ApiError(
        "INFRASTRUCTURE_ERROR",
        "Invalid conversations response"
      );
    }
    return conversations.map(parseConversation);
  },

  async getAdvisorConversations(advisorId: string): Promise<Conversation[]> {
    const response = await request(`/advisors/${advisorId}/conversations`);
    if (!isJsonObject(response) || !Array.isArray(response.conversations)) {
      throw new ApiError(
        "INFRASTRUCTURE_ERROR",
        "Invalid conversations response"
      );
    }
    const conversations = response.conversations.filter(isJsonObject);
    if (conversations.length !== response.conversations.length) {
      throw new ApiError(
        "INFRASTRUCTURE_ERROR",
        "Invalid conversations response"
      );
    }
    return conversations.map(parseConversation);
  },

  async getMessages(conversationId: string): Promise<Message[]> {
    const response = await request(`/conversations/${conversationId}/messages`);
    if (!isJsonObject(response) || !Array.isArray(response.messages)) {
      throw new ApiError("INFRASTRUCTURE_ERROR", "Invalid messages response");
    }
    const messages = response.messages.filter(isJsonObject);
    if (messages.length !== response.messages.length) {
      throw new ApiError("INFRASTRUCTURE_ERROR", "Invalid messages response");
    }
    return messages.map(parseMessage);
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
      conversationId: String(response.conversation.id),
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
    return { messageId: String(response.message.id) };
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
