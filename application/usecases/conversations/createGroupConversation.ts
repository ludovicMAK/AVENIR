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
import { CreateGroupConversationRequest } from "@application/requests/conversations";
import {
  ValidationError,
  NotFoundError,
  ConnectedError,
  ForbiddenError,
} from "@application/errors";

export class CreateGroupConversation {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly messageRepository: MessageRepository,
    private readonly participantConversationRepository: ParticipantConversationRepository,
    private readonly sessionRepository: SessionRepository,
    private readonly userRepository: UserRepository,
    private readonly uuidGenerator: UuidGenerator,
    private readonly webSocketService?: WebSocketService
  ) {}

  async execute(
    request: CreateGroupConversationRequest
  ): Promise<Conversation> {
    const isConnected = await this.sessionRepository.isConnected(
      request.creatorId,
      request.token
    );
    if (!isConnected) {
      throw new ConnectedError("User is not connected");
    }

    if (!request.initialMessage || request.initialMessage.trim().length === 0) {
      throw new ValidationError("Initial message cannot be empty");
    }

    const creator = await this.userRepository.findById(request.creatorId);
    if (!creator) {
      throw new NotFoundError("Creator not found");
    }

    // Only advisors and directors can create group conversations
    if (
      !creator.role.equals(Role.ADVISOR) &&
      !creator.role.equals(Role.MANAGER)
    ) {
      throw new ForbiddenError(
        "Only advisors and directors can create group conversations"
      );
    }

    const conversationId = this.uuidGenerator.generate();
    const conversation = new Conversation(
      conversationId,
      ConversationStatus.OPEN,
      ConversationType.GROUP,
      new Date(),
      null // group conversations don't have a specific customer
    );

    await this.conversationRepository.save(conversation);

    // Add creator as a participant
    const participantId = this.uuidGenerator.generate();
    const participant = new ParticipantConversation(
      participantId,
      conversationId,
      request.creatorId,
      new Date(),
      null,
      true // creator is principal
    );

    await this.participantConversationRepository.save(participant);

    // Auto-add all managers to the group conversation
    const managers = await this.userRepository.findByRole("bankManager");
    for (const manager of managers) {
      // Skip if manager is already the creator
      if (manager.id !== request.creatorId) {
        const managerParticipantId = this.uuidGenerator.generate();
        const managerParticipant = new ParticipantConversation(
          managerParticipantId,
          conversationId,
          manager.id,
          new Date(),
          null,
          false
        );
        await this.participantConversationRepository.save(managerParticipant);
      }
    }

    // Send initial message
    const messageId = this.uuidGenerator.generate();
    const message = new Message(
      messageId,
      conversationId,
      request.creatorId,
      creator.role.getValue(),
      request.initialMessage.trim(),
      new Date()
    );

    await this.messageRepository.save(message);

    // Emit WebSocket events if service is available
    if (this.webSocketService) {
      await this.webSocketService.joinConversationRoom(
        request.creatorId,
        conversationId
      );
      await this.webSocketService.emitNewMessage(conversationId, message);
    }

    return conversation;
  }
}
