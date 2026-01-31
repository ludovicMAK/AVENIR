import { request } from "./client";
import { ApiError } from "@/lib/errors";
import { isJsonObject } from "@/lib/json";
import { JsonObject } from "@/types/json";
import { UserRole, UserStatus } from "@/types/users";

export interface Conversation {
  id: string;
  subject: string;
  status: string;
  createdAt: string;
  closedAt?: string;
  customerId: string;
  assignedAdvisorId?: string;
  type?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole?: UserRole;
  senderName?: string;
  content: string;
  sentAt: string;
}

export interface CreateConversationRequest {
  initialMessage: string;
  customerId: string;
  assignedAdvisorId?: string;
  type?: "private";
}

export interface CreateGroupConversationRequest {
  creatorId: string;
  subject?: string;
  initialMessage: string;
}

export interface SendMessageRequest {
  conversationId: string;
  senderId: string;
  text: string;
}

export interface TransferConversationRequest {
  conversationId: string;
  fromAdvisorId: string;
  toAdvisorId: string;
  reason: string;
}

export interface ConversationParticipant {
  id: string;
  firstname: string;
  lastname: string;
  role: UserRole;
  status: UserStatus;
  isPrincipalAdvisor?: boolean;
  isActiveParticipant?: boolean;
}

function parseConversation(data: JsonObject): Conversation {
  return {
    id: String(data.id ?? ""),
    subject: String(data.subject ?? "Conversation"),
    status: String(data.status ?? "open"),
    type: data.type !== undefined && data.type !== null ? String(data.type) : undefined,
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
  const senderRoleRaw =
    data.senderRole !== undefined && data.senderRole !== null
      ? String(data.senderRole)
      : data.sender_role !== undefined && data.sender_role !== null
      ? String(data.sender_role)
      : undefined;

  const senderRole: UserRole | undefined =
    senderRoleRaw === "customer" ||
    senderRoleRaw === "bankAdvisor" ||
    senderRoleRaw === "bankManager"
      ? senderRoleRaw
      : undefined;

  return {
    id: String(data.id ?? ""),
    conversationId: String(data.conversationId ?? data.conversation_id ?? ""),
    senderId: String(data.senderId ?? ""),
    senderRole,
    senderName:
      data.senderName !== undefined && data.senderName !== null
        ? String(data.senderName)
        : undefined,
    content: String(data.content ?? data.text ?? ""),
    sentAt: String(data.sentAt ?? data.sendDate ?? new Date().toISOString()),
  };
}

function parseConversationParticipant(data: JsonObject): ConversationParticipant {
  const roleRaw = String(data.role ?? "");
  if (
    roleRaw !== "customer" &&
    roleRaw !== "bankAdvisor" &&
    roleRaw !== "bankManager"
  ) {
    throw new ApiError("INFRASTRUCTURE_ERROR", "Invalid participant role");
  }
  const role: UserRole = roleRaw;

  const statusRaw = String(data.status ?? "");
  if (statusRaw !== "active" && statusRaw !== "banned") {
    throw new ApiError("INFRASTRUCTURE_ERROR", "Invalid participant status");
  }
  const status: UserStatus = statusRaw;

  return {
    id: String(data.id ?? ""),
    firstname: String(data.firstname ?? ""),
    lastname: String(data.lastname ?? ""),
    role,
    status,
    isPrincipalAdvisor:
      typeof data.isPrincipalAdvisor === "boolean"
        ? data.isPrincipalAdvisor
        : undefined,
    isActiveParticipant:
      typeof data.isActiveParticipant === "boolean"
        ? data.isActiveParticipant
        : undefined,
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

  async getParticipants(conversationId: string): Promise<ConversationParticipant[]> {
    const response = await request(`/conversations/${conversationId}/participants`);
    if (!isJsonObject(response) || !Array.isArray(response.participants)) {
      throw new ApiError("INFRASTRUCTURE_ERROR", "Invalid participants response");
    }
    const participants = response.participants.filter(isJsonObject);
    if (participants.length !== response.participants.length) {
      throw new ApiError("INFRASTRUCTURE_ERROR", "Invalid participants response");
    }
    return participants.map(parseConversationParticipant);
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

  async closeConversation(conversationId: string, userId: string): Promise<void> {
    await request(`/conversations/${conversationId}/close`, {
      method: "PATCH",
      body: JSON.stringify({ userId }),
    });
  },

  async createGroupConversation(
    data: CreateGroupConversationRequest
  ): Promise<{ conversationId: string }> {
    const response = await request("/conversations/group", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!isJsonObject(response) || !isJsonObject(response.conversation)) {
      throw new ApiError(
        "INFRASTRUCTURE_ERROR",
        "Invalid create group conversation response"
      );
    }
    return { conversationId: String(response.conversation.id) };
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
