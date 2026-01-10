import { Request, Response } from "express";
import { ConversationController } from "@express/controllers/ConversationController";
import { sendSuccess } from "../responses/success";
import { mapErrorToHttpResponse } from "../responses/error";
import { CreateConversationSchema } from "@express/schemas/CreateConversationSchema";
import { CreateGroupConversationSchema } from "@express/schemas/CreateGroupConversationSchema";
import { SendMessageSchema } from "@express/schemas/SendMessageSchema";
import { TransferConversationSchema } from "@express/schemas/TransferConversationSchema";
import { CloseConversationSchema } from "@express/schemas/CloseConversationSchema";
import { GetConversationMessagesSchema } from "@express/schemas/GetConversationMessagesSchema";
import {
  GetCustomerConversationsSchema,
  GetAdvisorConversationsSchema,
} from "@express/schemas/GetConversationsSchema";
import {
  ConversationResponseData,
  ConversationsListResponseData,
  MessageResponseData,
  MessagesListResponseData,
} from "@express/types/responses";
import { AuthGuard } from "@express/src/http/AuthGuard";
import { UnauthorizedError } from "@application/errors";

export class ConversationHttpHandler {
  constructor(
    private readonly controller: ConversationController,
    private readonly authGuard: AuthGuard
  ) {}

  private extractToken(request: Request): string | null {
    const authHeader = request.headers.authorization as string;
    if (!authHeader) return null;
    const [scheme, token] = authHeader.split(" ");
    if (scheme?.toLowerCase() === "bearer" && token) return token;
    return authHeader;
  }

  private async getAuthContext(request: Request) {
    const user = await this.authGuard.requireAuthenticated(request);
    const token = this.extractToken(request);
    if (!token) {
      throw new UnauthorizedError("Authentication required");
    }
    return { user, token };
  }

  public async create(request: Request, response: Response) {
    try {
      const { token } = await this.getAuthContext(request);

      const validatedData = CreateConversationSchema.parse(request.body);

      const conversation = await this.controller.create(
        validatedData.customerId,
        validatedData.initialMessage,
        validatedData.assignedAdvisorId,
        token,
        validatedData.type
      );

      return sendSuccess<ConversationResponseData>(response, {
        status: 201,
        code: "CONVERSATION_CREATED",
        message: "Conversation successfully created.",
        data: {
          conversation: {
            id: conversation.id,
            status: conversation.status.toString(),
            type: conversation.type.toString(),
            dateOuverture: conversation.dateOuverture,
            customerId: conversation.customerId,
          },
        },
      });
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }

  public async sendMessage(request: Request, response: Response) {
    try {
      const { token } = await this.getAuthContext(request);

      const validatedData = SendMessageSchema.parse(request.body);

      const message = await this.controller.sendMessageToConversation(
        validatedData.conversationId,
        validatedData.senderId,
        validatedData.text,
        token
      );

      return sendSuccess<MessageResponseData>(response, {
        status: 201,
        code: "MESSAGE_SENT",
        message: "Message successfully sent.",
        data: {
          message: {
            id: message.id,
            conversationId: message.conversationId,
            senderId: message.senderId,
            senderRole: message.senderRole,
            text: message.text,
            sendDate: message.sendDate,
          },
        },
      });
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }

  public async transfer(request: Request, response: Response) {
    try {
      const { token } = await this.getAuthContext(request);

      const validatedData = TransferConversationSchema.parse(request.body);

      await this.controller.transfer(
        validatedData.conversationId,
        validatedData.fromAdvisorId,
        validatedData.toAdvisorId,
        validatedData.reason,
        token
      );

      return sendSuccess(response, {
        status: 200,
        code: "CONVERSATION_TRANSFERRED",
        message: "Conversation successfully transferred.",
      });
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }

  public async close(request: Request, response: Response) {
    try {
      const { token } = await this.getAuthContext(request);

      const validatedData = CloseConversationSchema.parse({
        conversationId: request.params.conversationId,
        userId: request.body.userId,
      });

      await this.controller.close(
        validatedData.conversationId,
        validatedData.userId,
        token
      );

      return sendSuccess(response, {
        status: 200,
        code: "CONVERSATION_CLOSED",
        message: "Conversation successfully closed.",
      });
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }

  public async getMessages(request: Request, response: Response) {
    try {
      const { user, token } = await this.getAuthContext(request);

      const validatedData = GetConversationMessagesSchema.parse({
        conversationId: request.params.conversationId,
        userId: user.id,
      });

      const messages = await this.controller.getMessages(
        validatedData.conversationId,
        validatedData.userId,
        token
      );

      const messagesView = messages.map((msg) => ({
        id: msg.id,
        conversationId: msg.conversationId,
        senderId: msg.senderId,
        senderRole: msg.senderRole,
        text: msg.text,
        sendDate: msg.sendDate,
      }));

      return sendSuccess<MessagesListResponseData>(response, {
        status: 200,
        code: "MESSAGES_RETRIEVED",
        message: "Messages successfully retrieved.",
        data: { messages: messagesView },
      });
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }

  public async getMyConversations(request: Request, response: Response) {
    try {
      const { user, token } = await this.getAuthContext(request);

      const conversations = await this.controller.getCustomerConversationsList(
        user.id,
        token
      );

      // Sérialiser les conversations pour convertir les Value Objects en strings
      const serializedConversations = conversations.map((conv) => ({
        id: conv.id,
        status: typeof conv.status === 'string' ? conv.status : conv.status.toString(),
        type: typeof conv.type === 'string' ? conv.type : conv.type.toString(),
        dateOuverture: conv.dateOuverture,
        customerId: conv.customerId,
      }));

      return sendSuccess<ConversationsListResponseData>(response, {
        status: 200,
        code: "CONVERSATIONS_FOUND",
        message: "Customer conversations retrieved successfully.",
        data: { conversations: serializedConversations },
      });
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }

  public async getCustomerConversations(request: Request, response: Response) {
    try {
      const { token } = await this.getAuthContext(request);

      const validatedData = GetCustomerConversationsSchema.parse({
        customerId: request.params.customerId,
      });

      const conversations = await this.controller.getCustomerConversationsList(
        validatedData.customerId,
        token
      );

      return sendSuccess<ConversationsListResponseData>(response, {
        status: 200,
        code: "CONVERSATIONS_RETRIEVED",
        message: "Conversations successfully retrieved.",
        data: {
          conversations: conversations.map((c) => ({
            id: c.id,
            status: c.status.toString(),
            type: c.type.toString(),
            dateOuverture: c.dateOuverture,
            customerId: c.customerId,
          })),
        },
      });
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }

  public async getAdvisorConversations(request: Request, response: Response) {
    try {
      const { token } = await this.getAuthContext(request);

      const validatedData = GetAdvisorConversationsSchema.parse({
        advisorId: request.params.advisorId,
      });

      const conversations = await this.controller.getAdvisorConversationsList(
        validatedData.advisorId,
        token
      );

      return sendSuccess<ConversationsListResponseData>(response, {
        status: 200,
        code: "CONVERSATIONS_RETRIEVED",
        message: "Conversations successfully retrieved.",
        data: {
          conversations: conversations.map((c) => ({
            id: c.id,
            status: c.status.toString(),
            type: c.type.toString(),
            dateOuverture: c.dateOuverture,
            customerId: c.customerId,
          })),
        },
      });
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }

  public async createGroup(request: Request, response: Response) {
    try {
      const { user, token } = await this.getAuthContext(request);

      const validatedData = CreateGroupConversationSchema.parse(request.body);

      const conversation = await this.controller.createGroup(
        validatedData.creatorId ?? user.id,
        validatedData.initialMessage,
        token
      );

      return sendSuccess<ConversationResponseData>(response, {
        status: 201,
        code: "GROUP_CONVERSATION_CREATED",
        message: "Group conversation successfully created.",
        data: {
          conversation: {
            id: conversation.id,
            status: conversation.status.toString(),
            type: conversation.type.toString(),
            dateOuverture: conversation.dateOuverture,
            customerId: conversation.customerId,
          },
        },
      });
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }

  public async addParticipant(request: Request, response: Response) {
    try {
      const { user, token } = await this.getAuthContext(request);

      const { conversationId } = request.params;
      const { userId, participantUserId } = request.body;

      if (!userId || !participantUserId) {
        return response.status(400).json({
          status: 400,
          code: "VALIDATION_ERROR",
          message: "userId and participantUserId are required",
        });
      }

      await this.controller.addParticipantToConversation(
        conversationId,
        userId ?? user.id,
        participantUserId,
        token
      );

      return sendSuccess(response, {
        status: 200,
        code: "PARTICIPANT_ADDED",
        message: "Participant successfully added to conversation.",
      });
    } catch (error) {
      return mapErrorToHttpResponse(response, error);
    }
  }
}
