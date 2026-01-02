import { ConversationRepository } from "@application/repositories/conversation";
import { ParticipantConversationRepository } from "@application/repositories/participantConversation";
import { TransferConversationRepository } from "@application/repositories/transferConversation";
import { SessionRepository } from "@application/repositories/session";
import { UserRepository } from "@application/repositories/users";
import { UuidGenerator } from "@application/services/UuidGenerator";
import { WebSocketService } from "@application/services/WebSocketService";
import { ParticipantConversation } from "@domain/entities/participantConversation";
import { TransferConversation } from "@domain/entities/transferConversation";
import { ConversationStatus } from "@domain/values/conversationStatus";
import { Role } from "@domain/values/role";
import { TransferConversationRequest } from "@application/requests/conversations";
import {
  ValidationError,
  NotFoundError,
  ConnectedError,
  ForbiddenError,
} from "@application/errors";

export class TransferConversationUseCase {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly participantConversationRepository: ParticipantConversationRepository,
    private readonly transferConversationRepository: TransferConversationRepository,
    private readonly sessionRepository: SessionRepository,
    private readonly userRepository: UserRepository,
    private readonly uuidGenerator: UuidGenerator,
    private readonly webSocketService?: WebSocketService
  ) {}

  async execute(request: TransferConversationRequest): Promise<void> {
    const isConnected = await this.sessionRepository.isConnected(
      request.fromAdvisorId,
      request.token
    );
    if (!isConnected) {
      throw new ConnectedError("User is not connected");
    }

    if (!request.reason || request.reason.trim().length === 0) {
      throw new ValidationError("Transfer reason cannot be empty");
    }

    const conversation = await this.conversationRepository.findById(
      request.conversationId
    );
    if (!conversation) {
      throw new NotFoundError("Conversation not found");
    }

    if (conversation.isClosed()) {
      throw new ValidationError("Cannot transfer a closed conversation");
    }

    const fromAdvisor = await this.userRepository.findById(
      request.fromAdvisorId
    );
    if (!fromAdvisor) {
      throw new NotFoundError("Source advisor not found");
    }

    if (!fromAdvisor.role.equals(Role.ADVISOR)) {
      throw new ValidationError("Source user must be an advisor");
    }

    const fromParticipant =
      await this.participantConversationRepository.findByConversationIdAndAdvisorId(
        request.conversationId,
        request.fromAdvisorId
      );

    if (!fromParticipant) {
      throw new ForbiddenError(
        "Source advisor is not a participant in this conversation"
      );
    }

    if (!fromParticipant.isActive()) {
      throw new ForbiddenError(
        "Source advisor is no longer active in this conversation"
      );
    }

    const toAdvisor = await this.userRepository.findById(request.toAdvisorId);
    if (!toAdvisor) {
      throw new NotFoundError("Target advisor not found");
    }

    if (!toAdvisor.role.equals(Role.ADVISOR)) {
      throw new ValidationError("Target user must be an advisor");
    }

    if (request.fromAdvisorId === request.toAdvisorId) {
      throw new ValidationError(
        "Cannot transfer conversation to the same advisor"
      );
    }

    const existingParticipant =
      await this.participantConversationRepository.findByConversationIdAndAdvisorId(
        request.conversationId,
        request.toAdvisorId
      );

    if (existingParticipant && existingParticipant.isActive()) {
      throw new ValidationError(
        "Target advisor is already an active participant"
      );
    }

    const transferId = this.uuidGenerator.generate();
    const transfer = new TransferConversation(
      transferId,
      request.conversationId,
      request.fromAdvisorId,
      request.toAdvisorId,
      request.reason.trim(),
      new Date()
    );

    await this.transferConversationRepository.save(transfer);

    const participantId = this.uuidGenerator.generate();
    const newParticipant = new ParticipantConversation(
      participantId,
      request.conversationId,
      request.toAdvisorId,
      new Date(),
      null,
      false
    );

    await this.participantConversationRepository.save(newParticipant);

    await this.conversationRepository.updateStatus(
      request.conversationId,
      ConversationStatus.TRANSFERRED
    );

    // Emit WebSocket events if service is available
    if (this.webSocketService) {
      await this.webSocketService.emitConversationTransferred(
        request.conversationId,
        request.fromAdvisorId,
        request.toAdvisorId
      );
      await this.webSocketService.joinConversationRoom(
        request.toAdvisorId,
        request.conversationId
      );
    }
  }
}
