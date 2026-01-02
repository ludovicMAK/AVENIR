import { ConversationRepository } from "@application/repositories/conversation";
import { MessageRepository } from "@application/repositories/message";
import { ParticipantConversationRepository } from "@application/repositories/participantConversation";
import { SessionRepository } from "@application/repositories/session";
import { UserRepository } from "@application/repositories/users";
import { UuidGenerator } from "@application/services/UuidGenerator";
import { WebSocketService } from "@application/services/WebSocketService";
import { Message } from "@domain/entities/message";
import { Role } from "@domain/values/role";
import { SendMessageRequest } from "@application/requests/conversations";
import {
  ValidationError,
  NotFoundError,
  ConnectedError,
  ForbiddenError,
} from "@application/errors";

export class SendMessage {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly messageRepository: MessageRepository,
    private readonly participantConversationRepository: ParticipantConversationRepository,
    private readonly sessionRepository: SessionRepository,
    private readonly userRepository: UserRepository,
    private readonly uuidGenerator: UuidGenerator,
    private readonly webSocketService?: WebSocketService
  ) {}

  async execute(request: SendMessageRequest): Promise<Message> {
    const isConnected = await this.sessionRepository.isConnected(
      request.senderId,
      request.token
    );
    if (!isConnected) {
      throw new ConnectedError("User is not connected");
    }

    if (!request.text || request.text.trim().length === 0) {
      throw new ValidationError("Message text cannot be empty");
    }

    const conversation = await this.conversationRepository.findById(
      request.conversationId
    );
    if (!conversation) {
      throw new NotFoundError("Conversation not found");
    }

    if (conversation.isClosed()) {
      throw new ValidationError("Cannot send message to a closed conversation");
    }

    const sender = await this.userRepository.findById(request.senderId);
    if (!sender) {
      throw new NotFoundError("Sender not found");
    }

    // For group conversations
    if (conversation.type.isGroup()) {
      // Only advisors and directors can send messages in group conversations
      if (
        !sender.role.equals(Role.ADVISOR) &&
        !sender.role.equals(Role.MANAGER)
      ) {
        throw new ForbiddenError(
          "Only advisors and directors can send messages in group conversations"
        );
      }

      // Check if sender is a participant
      const participant =
        await this.participantConversationRepository.findByConversationIdAndAdvisorId(
          request.conversationId,
          request.senderId
        );

      if (!participant) {
        throw new ForbiddenError(
          "User must be a participant to send messages in group conversations"
        );
      }

      if (!participant.canSendMessages()) {
        throw new ForbiddenError(
          "User is no longer active in this conversation"
        );
      }
    }
    // For private conversations
    else {
      if (sender.role.equals(Role.CUSTOMER)) {
        if (conversation.customerId !== request.senderId) {
          throw new ForbiddenError(
            "Customer can only send messages to their own conversations"
          );
        }
      } else if (sender.role.equals(Role.ADVISOR)) {
        const participant =
          await this.participantConversationRepository.findByConversationIdAndAdvisorId(
            request.conversationId,
            request.senderId
          );

        if (!participant) {
          throw new ForbiddenError(
            "Advisor must be a participant to send messages"
          );
        }

        if (!participant.canSendMessages()) {
          throw new ForbiddenError(
            "Advisor is no longer active in this conversation"
          );
        }
      } else {
        throw new ForbiddenError(
          "Only customers and advisors can send messages in private conversations"
        );
      }
    }

    const messageId = this.uuidGenerator.generate();
    const message = new Message(
      messageId,
      request.conversationId,
      request.senderId,
      sender.role.getValue(),
      request.text.trim(),
      new Date()
    );

    await this.messageRepository.save(message);

    // Emit message to WebSocket if service is available
    if (this.webSocketService) {
      await this.webSocketService.emitNewMessage(
        request.conversationId,
        message
      );
    }

    return message;
  }
}
