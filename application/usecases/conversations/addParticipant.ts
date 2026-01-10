import {
  ConnectedError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "@application/errors";
import { ParticipantConversationRepository } from "@application/repositories/participantConversation";
import { SessionRepository } from "@application/repositories/session";
import { UserRepository } from "@application/repositories/users";
import { ConversationRepository } from "@application/repositories/conversation";
import { UuidGenerator } from "@application/services/UuidGenerator";
import { ParticipantConversation } from "@domain/entities/participantConversation";
import { Role } from "@domain/values/role";
import { ConversationType } from "@domain/values/conversationType";
import { WebSocketService } from "@application/services/WebSocketService";

export interface AddParticipantRequest {
  conversationId: string;
  userId: string;
  participantUserId: string;
  token: string;
}

export class AddParticipant {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly participantConversationRepository: ParticipantConversationRepository,
    private readonly userRepository: UserRepository,
    private readonly sessionRepository: SessionRepository,
    private readonly uuidGenerator: UuidGenerator,
    private readonly webSocketService?: WebSocketService
  ) {}

  async execute(request: AddParticipantRequest): Promise<void> {
    const isConnected = await this.sessionRepository.isConnected(
      request.userId,
      request.token
    );
    if (!isConnected) {
      throw new ConnectedError("User is not connected");
    }

    const user = await this.userRepository.findById(request.userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const conversation = await this.conversationRepository.findById(
      request.conversationId
    );
    if (!conversation) {
      throw new NotFoundError("Conversation not found");
    }

    const isManager = user.role.equals(Role.MANAGER);

    const participants =
      await this.participantConversationRepository.findByConversationId(
        request.conversationId
      );
    const isPrincipalAdvisor = participants.some(
      (p) => p.advisorId === request.userId && p.isPrincipal()
    );

    if (!isManager && !isPrincipalAdvisor) {
      throw new ForbiddenError(
        "Only managers or the principal advisor can add participants"
      );
    }

    if (!conversation.type.equals(ConversationType.GROUP)) {
      throw new ValidationError(
        "Can only add participants to group conversations"
      );
    }

    if (conversation.isClosed()) {
      throw new ValidationError(
        "Cannot add participants to closed conversation"
      );
    }

    const participantUser = await this.userRepository.findById(
      request.participantUserId
    );
    if (!participantUser) {
      throw new NotFoundError("Participant user not found");
    }

    if (
      !participantUser.role.equals(Role.ADVISOR) &&
      !participantUser.role.equals(Role.MANAGER)
    ) {
      throw new ValidationError(
        "Only advisors and managers can be added to group conversations"
      );
    }

    const isAlreadyParticipant = participants.some(
      (p) => p.advisorId === request.participantUserId
    );

    if (isAlreadyParticipant) {
      throw new ValidationError("User is already a participant");
    }

    const participantId = this.uuidGenerator.generate();
    const participant = new ParticipantConversation(
      participantId,
      request.conversationId,
      request.participantUserId,
      new Date(),
      null,
      false
    );

    await this.participantConversationRepository.save(participant);

    if (this.webSocketService) {
      await this.webSocketService.joinConversationRoom(
        request.participantUserId,
        request.conversationId
      );
    }
  }
}
