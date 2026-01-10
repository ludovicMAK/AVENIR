import { ConversationRepository } from "@application/repositories/conversation";
import { MessageRepository } from "@application/repositories/message";
import { ParticipantConversationRepository } from "@application/repositories/participantConversation";
import { SessionRepository } from "@application/repositories/session";
import { UserRepository } from "@application/repositories/users";
import { UuidGenerator } from "@application/services/UuidGenerator";
import { WebSocketService } from "@application/services/WebSocketService";
import { Conversation } from "@domain/entities/conversation";
import { Message } from "@domain/entities/message";
import { ParticipantConversation } from "@domain/entities/participantConversation";
import { ConversationStatus } from "@domain/values/conversationStatus";
import { ConversationType } from "@domain/values/conversationType";
import { Role } from "@domain/values/role";
import { CreateConversationRequest } from "@application/requests/conversations";
import {
  ValidationError,
  NotFoundError,
  ConnectedError,
} from "@application/errors";

export class CreateConversation {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly messageRepository: MessageRepository,
    private readonly participantConversationRepository: ParticipantConversationRepository,
    private readonly sessionRepository: SessionRepository,
    private readonly userRepository: UserRepository,
    private readonly uuidGenerator: UuidGenerator,
    private readonly webSocketService?: WebSocketService
  ) {}

  async execute(request: CreateConversationRequest): Promise<Conversation> {
    const isConnected = await this.sessionRepository.isConnected(
      request.customerId,
      request.token
    );
    if (!isConnected) {
      throw new ConnectedError("User is not connected");
    }

    if (!request.initialMessage || request.initialMessage.trim().length === 0) {
      throw new ValidationError("Initial message cannot be empty");
    }

    const customer = await this.userRepository.findById(request.customerId);
    if (!customer) {
      throw new NotFoundError("Customer not found");
    }

    if (!customer.role.equals(Role.CUSTOMER)) {
      throw new ValidationError("Only customers can create conversations");
    }

    const advisor = await this.userRepository.findById(
      request.assignedAdvisorId
    );
    if (!advisor) {
      throw new NotFoundError("Advisor not found");
    }

    if (!advisor.role.equals(Role.ADVISOR)) {
      throw new ValidationError("Assigned user must be an advisor");
    }

    const conversationId = this.uuidGenerator.generate();
    const conversationType =
      request.type === "group"
        ? ConversationType.GROUP
        : ConversationType.PRIVATE;

    const conversation = new Conversation(
      conversationId,
      ConversationStatus.OPEN,
      conversationType,
      new Date(),
      request.customerId
    );

    await this.conversationRepository.save(conversation);

    const participantId = this.uuidGenerator.generate();
    const participant = new ParticipantConversation(
      participantId,
      conversationId,
      request.assignedAdvisorId,
      new Date(),
      null,
      true
    );

    await this.participantConversationRepository.save(participant);

    const messageId = this.uuidGenerator.generate();
    const message = new Message(
      messageId,
      conversationId,
      request.customerId,
      customer.role.getValue(),
      request.initialMessage.trim(),
      new Date()
    );

    await this.messageRepository.save(message);

    if (this.webSocketService) {
      await this.webSocketService.emitConversationCreated(conversation);
      await this.webSocketService.joinConversationRoom(
        request.customerId,
        conversationId
      );
      await this.webSocketService.joinConversationRoom(
        request.assignedAdvisorId,
        conversationId
      );
      await this.webSocketService.emitNewMessage(conversationId, message);
    }

    return conversation;
  }
}
