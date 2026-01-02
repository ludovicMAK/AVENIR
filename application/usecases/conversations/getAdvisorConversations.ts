import { ConversationRepository } from "@application/repositories/conversation";
import { ParticipantConversationRepository } from "@application/repositories/participantConversation";
import { SessionRepository } from "@application/repositories/session";
import { UserRepository } from "@application/repositories/users";
import { Conversation } from "@domain/entities/conversation";
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

    if (!advisor.role.equals(Role.ADVISOR)) {
      throw new ForbiddenError("User must be an advisor");
    }

    const participants =
      await this.participantConversationRepository.findByAdvisorId(
        request.advisorId
      );

    const conversationIds = participants.map((p) => p.conversationId);

    const conversations: Conversation[] = [];
    for (const conversationId of conversationIds) {
      const conversation = await this.conversationRepository.findById(
        conversationId
      );
      if (conversation) {
        conversations.push(conversation);
      }
    }

    return conversations;
  }
}
