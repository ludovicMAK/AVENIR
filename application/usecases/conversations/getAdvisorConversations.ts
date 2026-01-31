import { ConversationRepository } from "@application/repositories/conversation";
import { ParticipantConversationRepository } from "@application/repositories/participantConversation";
import { SessionRepository } from "@application/repositories/session";
import { UserRepository } from "@application/repositories/users";
import { Conversation } from "@domain/entities/conversation";
import { ConversationStatus } from "@domain/values/conversationStatus";
import { Role } from "@domain/values/role";
import { GetAdvisorConversationsRequest } from "@application/requests/conversations";
import {
  NotFoundError,
  ConnectedError,
  ForbiddenError,
} from "@application/errors";

export class GetAdvisorConversations {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly participantConversationRepository: ParticipantConversationRepository,
    private readonly sessionRepository: SessionRepository,
    private readonly userRepository: UserRepository
  ) {}

  async execute(
    request: GetAdvisorConversationsRequest
  ): Promise<Conversation[]> {
    const isConnected = await this.sessionRepository.isConnected(
      request.advisorId,
      request.token
    );
    if (!isConnected) {
      throw new ConnectedError("User is not connected");
    }

    const advisor = await this.userRepository.findById(request.advisorId);
    if (!advisor) {
      throw new NotFoundError("Advisor not found");
    }

    if (!advisor.role.equals(Role.ADVISOR) && !advisor.role.equals(Role.MANAGER)) {
      throw new ForbiddenError("User must be an advisor or a director");
    }

    const participants =
      await this.participantConversationRepository.findByAdvisorId(
        request.advisorId
      );

    const conversationIds = Array.from(new Set(participants.map((p) => p.conversationId)));

    const conversationsById: Map<string, Conversation> = new Map();
    for (const conversationId of conversationIds) {
      const conversation = await this.conversationRepository.findById(
        conversationId
      );
      if (conversation) {
        conversationsById.set(conversation.id, conversation);
      }
    }

    if (advisor.role.equals(Role.ADVISOR)) {
      const openConversations = await this.conversationRepository.findByStatus(
        ConversationStatus.OPEN
      );

      for (const conversation of openConversations) {
        if (!conversation.type.isPrivate()) continue;
        if (!conversation.customerId) continue;
        if (conversationsById.has(conversation.id)) continue;

        const activeParticipants =
          await this.participantConversationRepository.findActiveByConversationId(
            conversation.id
          );

        if (activeParticipants.length === 0) {
          conversationsById.set(conversation.id, conversation);
        }
      }
    }

    for (const [conversationId, conversation] of conversationsById.entries()) {
      if (!conversation.type.isPrivate()) continue;
      if (!conversation.customerId) continue;
      if (!conversation.subject.toLowerCase().includes("en attente")) continue;

      const activeParticipants =
        await this.participantConversationRepository.findActiveByConversationId(
          conversationId
        );
      if (activeParticipants.length === 0) continue;

      const principal =
        activeParticipants.find((participant) => participant.isPrincipal()) ??
        activeParticipants[0];

      const customer = await this.userRepository.findById(conversation.customerId);
      const principalAdvisor = await this.userRepository.findById(principal.advisorId);
      if (!customer || !principalAdvisor) continue;

      const subject = `${customer.firstname} ${customer.lastname} • ${principalAdvisor.firstname} ${principalAdvisor.lastname}`;
      await this.conversationRepository.updateSubject(conversationId, subject);
      conversationsById.set(
        conversationId,
        new Conversation(
          conversation.id,
          subject,
          conversation.status,
          conversation.type,
          conversation.dateOuverture,
          conversation.customerId
        )
      );
    }

    return Array.from(conversationsById.values());
  }
}
