import { ConversationRepository } from "@application/repositories/conversation";
import { ParticipantConversationRepository } from "@application/repositories/participantConversation";
import { SessionRepository } from "@application/repositories/session";
import { UserRepository } from "@application/repositories/users";
import { WebSocketService } from "@application/services/WebSocketService";
import { ConversationStatus } from "@domain/values/conversationStatus";
import { Role } from "@domain/values/role";
import { CloseConversationRequest } from "@application/requests/conversations";
import {
  ValidationError,
  NotFoundError,
  ConnectedError,
  ForbiddenError,
} from "@application/errors";

export class CloseConversation {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly participantConversationRepository: ParticipantConversationRepository,
    private readonly sessionRepository: SessionRepository,
    private readonly userRepository: UserRepository,
    private readonly webSocketService?: WebSocketService
  ) {}

  async execute(request: CloseConversationRequest): Promise<void> {
    const isConnected = await this.sessionRepository.isConnected(
      request.userId,
      request.token
    );
    if (!isConnected) {
      throw new ConnectedError("User is not connected");
    }

    const conversation = await this.conversationRepository.findById(
      request.conversationId
    );
    if (!conversation) {
      throw new NotFoundError("Conversation not found");
    }

    if (conversation.isClosed()) {
      throw new ValidationError("Conversation is already closed");
    }

    const user = await this.userRepository.findById(request.userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (user.role.equals(Role.CUSTOMER)) {
      if (conversation.customerId !== request.userId) {
        throw new ForbiddenError(
          "Customer can only close their own conversations"
        );
      }
    } else if (user.role.equals(Role.ADVISOR)) {
      const participant =
        await this.participantConversationRepository.findByConversationIdAndAdvisorId(
          request.conversationId,
          request.userId
        );

      if (!participant) {
        throw new ForbiddenError(
          "Advisor must be a participant to close conversation"
        );
      }

      if (!participant.isActive()) {
        throw new ForbiddenError(
          "Advisor is no longer active in this conversation"
        );
      }
    } else {
      throw new ForbiddenError(
        "Only customers and advisors can close conversations"
      );
    }

    await this.conversationRepository.updateStatus(
      request.conversationId,
      ConversationStatus.CLOSED
    );

    if (this.webSocketService) {
      await this.webSocketService.emitConversationClosed(
        request.conversationId
      );
    }
  }
}
