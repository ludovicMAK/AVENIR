import { CreateConversation } from "@application/usecases/conversations/createConversation";
import { CreateGroupConversation } from "@application/usecases/conversations/createGroupConversation";
import { SendMessage } from "@application/usecases/conversations/sendMessage";
import { TransferConversationUseCase } from "@application/usecases/conversations/transferConversation";
import { CloseConversation } from "@application/usecases/conversations/closeConversation";
import { GetConversationMessages } from "@application/usecases/conversations/getConversationMessages";
import { GetCustomerConversations } from "@application/usecases/conversations/getCustomerConversations";
import { GetAdvisorConversations } from "@application/usecases/conversations/getAdvisorConversations";
import { AddParticipant } from "@application/usecases/conversations/addParticipant";
import {
  GetConversationParticipants,
  ConversationParticipantInfo,
} from "@application/usecases/conversations/getConversationParticipants";
import { Conversation } from "@domain/entities/conversation";
import { Message } from "@domain/entities/message";

export class ConversationController {
  public constructor(
    private readonly createConversation: CreateConversation,
    private readonly createGroupConversation: CreateGroupConversation,
    private readonly sendMessage: SendMessage,
    private readonly transferConversation: TransferConversationUseCase,
    private readonly closeConversation: CloseConversation,
    private readonly getConversationMessages: GetConversationMessages,
    private readonly getCustomerConversations: GetCustomerConversations,
    private readonly getAdvisorConversations: GetAdvisorConversations,
    private readonly addParticipant: AddParticipant,
    private readonly getConversationParticipantsUsecase: GetConversationParticipants
  ) {}

  public async create(
    customerId: string,
    initialMessage: string,
    assignedAdvisorId: string | undefined,
    token: string,
    type?: "private"
  ): Promise<Conversation> {
    return await this.createConversation.execute({
      token,
      customerId,
      initialMessage,
      assignedAdvisorId,
      type,
    });
  }

  public async createGroup(
    creatorId: string,
    initialMessage: string,
    subject: string | undefined,
    token: string
  ): Promise<Conversation> {
    return await this.createGroupConversation.execute({
      token,
      creatorId,
      subject,
      initialMessage,
    });
  }

  public async sendMessageToConversation(
    conversationId: string,
    senderId: string,
    text: string,
    token: string
  ): Promise<Message> {
    return await this.sendMessage.execute({
      token,
      conversationId,
      senderId,
      text,
    });
  }

  public async transfer(
    conversationId: string,
    fromAdvisorId: string,
    toAdvisorId: string,
    reason: string,
    token: string
  ): Promise<void> {
    await this.transferConversation.execute({
      token,
      conversationId,
      fromAdvisorId,
      toAdvisorId,
      reason,
    });
  }

  public async close(
    conversationId: string,
    userId: string,
    token: string
  ): Promise<void> {
    await this.closeConversation.execute({
      token,
      conversationId,
      userId,
    });
  }

  public async getMessages(
    conversationId: string,
    userId: string,
    token: string
  ): Promise<Message[]> {
    return await this.getConversationMessages.execute({
      token,
      conversationId,
      userId,
    });
  }

  public async getCustomerConversationsList(
    customerId: string,
    token: string
  ): Promise<Conversation[]> {
    return await this.getCustomerConversations.execute({
      token,
      customerId,
    });
  }

  public async getAdvisorConversationsList(
    advisorId: string,
    token: string
  ): Promise<Conversation[]> {
    return await this.getAdvisorConversations.execute({
      token,
      advisorId,
    });
  }

  public async addParticipantToConversation(
    conversationId: string,
    userId: string,
    participantUserId: string,
    token: string
  ): Promise<void> {
    await this.addParticipant.execute({
      token,
      conversationId,
      userId,
      participantUserId,
    });
  }

  public async getConversationParticipants(
    conversationId: string,
    userId: string,
    token: string
  ): Promise<ConversationParticipantInfo[]> {
    return await this.getConversationParticipantsUsecase.execute({
      token,
      conversationId,
      userId,
    });
  }
}
