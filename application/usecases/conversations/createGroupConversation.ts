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
    private webSocketService?: WebSocketService
  ) {}

  setWebSocketService(service: WebSocketService): void {
    this.webSocketService = service;
  }

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

    if (
      !creator.role.equals(Role.ADVISOR) &&
      !creator.role.equals(Role.MANAGER)
    ) {
      throw new ForbiddenError(
        "Only advisors and directors can create group conversations"
      );
    }

    const subject =
      request.subject && request.subject.trim().length > 0
        ? request.subject.trim()
        : "Équipe";

    const conversationId = this.uuidGenerator.generate();
    const conversation = new Conversation(
      conversationId,
      subject,
      ConversationStatus.OPEN,
      ConversationType.GROUP,
      new Date(),
      null
    );

    await this.conversationRepository.save(conversation);

    const participantId = this.uuidGenerator.generate();
    const participant = new ParticipantConversation(
      participantId,
      conversationId,
      request.creatorId,
      new Date(),
      null,
      true
    );

    await this.participantConversationRepository.save(participant);

    const [advisors, managers] = await Promise.all([
      this.userRepository.findByRole("bankAdvisor"),
      this.userRepository.findByRole("bankManager"),
    ]);

    const staff = [...advisors, ...managers];
    const staffIds = Array.from(
      new Set(staff.map((staffMember) => staffMember.id))
    ).filter((staffId) => staffId !== request.creatorId);

    for (const staffId of staffIds) {
      const staffParticipantId = this.uuidGenerator.generate();
      const staffParticipant = new ParticipantConversation(
        staffParticipantId,
        conversationId,
        staffId,
        new Date(),
        null,
        false
      );
      await this.participantConversationRepository.save(staffParticipant);
    }

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

    if (this.webSocketService) {
      await this.webSocketService.joinConversationRoom(request.creatorId, conversationId);
      for (const staffId of staffIds) {
        await this.webSocketService.joinConversationRoom(staffId, conversationId);
      }
      await this.webSocketService.emitNewMessage(conversationId, message);
    }

    return conversation;
  }
}
