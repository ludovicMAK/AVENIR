import { ConversationRepository } from "@application/repositories/conversation";
import { MessageRepository } from "@application/repositories/message";
import { ParticipantConversationRepository } from "@application/repositories/participantConversation";
import { SessionRepository } from "@application/repositories/session";
import { UserRepository } from "@application/repositories/users";
import { Message } from "@domain/entities/message";
import { Role } from "@domain/values/role";
import { GetConversationMessagesRequest } from "@application/requests/conversations";
import {
  NotFoundError,
  ConnectedError,
  ForbiddenError,
} from "@application/errors";

export class GetConversationMessages {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly messageRepository: MessageRepository,
    private readonly participantConversationRepository: ParticipantConversationRepository,
    private readonly sessionRepository: SessionRepository,
    private readonly userRepository: UserRepository
  ) {}

  async execute(request: GetConversationMessagesRequest): Promise<Message[]> {
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

    const user = await this.userRepository.findById(request.userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (user.role.equals(Role.CUSTOMER)) {
      if (conversation.type.isGroup()) {
        throw new ForbiddenError(
          "Customers cannot view group conversation messages"
        );
      }

      if (conversation.customerId !== request.userId) {
        throw new ForbiddenError(
          "Customer can only view their own conversations"
        );
      }
    } else if (user.role.equals(Role.ADVISOR)) {
      const participant =
        await this.participantConversationRepository.findByConversationIdAndAdvisorId(
          request.conversationId,
          request.userId
        );

      if (!participant) {
        if (!conversation.type.isPrivate()) {
          throw new ForbiddenError("Advisor must be a participant to view messages");
        }

        const activeParticipants =
          await this.participantConversationRepository.findActiveByConversationId(
            request.conversationId
          );

        if (activeParticipants.length > 0) {
          throw new ForbiddenError("Advisor must be a participant to view messages");
        }
      }
    } else if (user.role.equals(Role.MANAGER)) {
      if (!conversation.type.isGroup()) {
        throw new ForbiddenError(
          "Directors can only view group conversation messages"
        );
      }

      const participant =
        await this.participantConversationRepository.findByConversationIdAndAdvisorId(
          request.conversationId,
          request.userId
        );
      if (!participant) {
        throw new ForbiddenError(
          "Director must be a participant to view messages"
        );
      }
    } else {
      throw new ForbiddenError("Unauthorized role");
    }

    const messages =
      await this.messageRepository.findByConversationIdOrderByDate(
        request.conversationId
      );

    return messages;
  }
}
