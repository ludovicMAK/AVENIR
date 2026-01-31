import { ConversationRepository } from "@application/repositories/conversation";
import { ParticipantConversationRepository } from "@application/repositories/participantConversation";
import { SessionRepository } from "@application/repositories/session";
import { UserRepository } from "@application/repositories/users";
import { GetConversationParticipantsRequest } from "@application/requests/conversations";
import {
  ConnectedError,
  ForbiddenError,
  NotFoundError,
} from "@application/errors";
import { User } from "@domain/entities/users";
import { Role } from "@domain/values/role";

export type ConversationParticipantInfo = {
  user: User;
  isPrincipalAdvisor: boolean | null;
  isActiveParticipant: boolean | null;
};

export class GetConversationParticipants {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly participantConversationRepository: ParticipantConversationRepository,
    private readonly sessionRepository: SessionRepository,
    private readonly userRepository: UserRepository
  ) {}

  async execute(
    request: GetConversationParticipantsRequest
  ): Promise<ConversationParticipantInfo[]> {
    const isConnected = await this.sessionRepository.isConnected(
      request.userId,
      request.token
    );
    if (!isConnected) {
      throw new ConnectedError("User is not connected");
    }

    const requester = await this.userRepository.findById(request.userId);
    if (!requester) {
      throw new NotFoundError("User not found");
    }

    const conversation = await this.conversationRepository.findById(
      request.conversationId
    );
    if (!conversation) {
      throw new NotFoundError("Conversation not found");
    }

    if (requester.role.equals(Role.CUSTOMER)) {
      if (conversation.type.isGroup()) {
        throw new ForbiddenError(
          "Customers cannot access group conversations"
        );
      }

      if (conversation.customerId !== request.userId) {
        throw new ForbiddenError(
          "Customer can only access their own conversations"
        );
      }
    } else if (requester.role.equals(Role.ADVISOR)) {
      const participant =
        await this.participantConversationRepository.findByConversationIdAndAdvisorId(
          request.conversationId,
          request.userId
        );
      if (!participant) {
        if (!conversation.type.isPrivate()) {
          throw new ForbiddenError(
            "Advisor must be a participant to access this conversation"
          );
        }

        const activeParticipants =
          await this.participantConversationRepository.findActiveByConversationId(
            request.conversationId
          );
        if (activeParticipants.length > 0) {
          throw new ForbiddenError(
            "Advisor must be a participant to access this conversation"
          );
        }
      }
    } else if (requester.role.equals(Role.MANAGER)) {
      if (!conversation.type.isGroup()) {
        throw new ForbiddenError(
          "Directors can only access group conversations"
        );
      }

      const participant =
        await this.participantConversationRepository.findByConversationIdAndAdvisorId(
          request.conversationId,
          request.userId
        );
      if (!participant) {
        throw new ForbiddenError(
          "Director must be a participant to access this conversation"
        );
      }
    } else {
      throw new ForbiddenError("Unauthorized role");
    }

    const resultsByUserId: Map<string, ConversationParticipantInfo> = new Map();

    if (conversation.customerId && conversation.type.isPrivate()) {
      const customer = await this.userRepository.findById(conversation.customerId);
      if (!customer) {
        throw new NotFoundError("Customer not found");
      }
      resultsByUserId.set(customer.id, {
        user: customer,
        isPrincipalAdvisor: null,
        isActiveParticipant: null,
      });
    }

    const staffParticipants =
      await this.participantConversationRepository.findActiveByConversationId(
        request.conversationId
      );

    for (const participant of staffParticipants) {
      const staffUser = await this.userRepository.findById(participant.advisorId);
      if (!staffUser) {
        throw new NotFoundError("Participant user not found");
      }

      const existing = resultsByUserId.get(staffUser.id);
      const info: ConversationParticipantInfo = {
        user: staffUser,
        isPrincipalAdvisor: participant.isPrincipal(),
        isActiveParticipant: participant.isActive(),
      };

      if (!existing) {
        resultsByUserId.set(staffUser.id, info);
        continue;
      }

      const existingIsPrincipal = existing.isPrincipalAdvisor ?? false;
      const incomingIsPrincipal = info.isPrincipalAdvisor ?? false;
      if (incomingIsPrincipal && !existingIsPrincipal) {
        resultsByUserId.set(staffUser.id, info);
      }
    }

    return Array.from(resultsByUserId.values());
  }
}
