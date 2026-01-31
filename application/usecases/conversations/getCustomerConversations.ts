import { ConversationRepository } from "@application/repositories/conversation";
import { ParticipantConversationRepository } from "@application/repositories/participantConversation";
import { SessionRepository } from "@application/repositories/session";
import { UserRepository } from "@application/repositories/users";
import { Conversation } from "@domain/entities/conversation";
import { Role } from "@domain/values/role";
import { GetCustomerConversationsRequest } from "@application/requests/conversations";
import {
  NotFoundError,
  ConnectedError,
  ForbiddenError,
} from "@application/errors";

export class GetCustomerConversations {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly participantConversationRepository: ParticipantConversationRepository,
    private readonly sessionRepository: SessionRepository,
    private readonly userRepository: UserRepository
  ) {}

  async execute(
    request: GetCustomerConversationsRequest
  ): Promise<Conversation[]> {
    const isConnected = await this.sessionRepository.isConnected(
      request.customerId,
      request.token
    );
    if (!isConnected) {
      throw new ConnectedError("User is not connected");
    }

    const customer = await this.userRepository.findById(request.customerId);
    if (!customer) {
      throw new NotFoundError("Customer not found");
    }

    if (!customer.role.equals(Role.CUSTOMER)) {
      throw new ForbiddenError("User must be a customer");
    }

    const conversations = await this.conversationRepository.findByCustomerId(
      request.customerId
    );

    const privateConversations = conversations.filter((conversation) =>
      conversation.type.isPrivate()
    );

    const fixedSubjects = await Promise.all(
      privateConversations.map(async (conversation) => {
        if (!conversation.subject.toLowerCase().includes("en attente")) {
          return conversation;
        }
        if (!conversation.customerId) return conversation;

        const activeParticipants =
          await this.participantConversationRepository.findActiveByConversationId(
            conversation.id
          );
        if (activeParticipants.length === 0) return conversation;

        const principal =
          activeParticipants.find((participant) => participant.isPrincipal()) ??
          activeParticipants[0];

        const advisor = await this.userRepository.findById(principal.advisorId);
        if (!advisor) return conversation;

        const subject = `${customer.firstname} ${customer.lastname} • ${advisor.firstname} ${advisor.lastname}`;
        await this.conversationRepository.updateSubject(conversation.id, subject);

        return new Conversation(
          conversation.id,
          subject,
          conversation.status,
          conversation.type,
          conversation.dateOuverture,
          conversation.customerId
        );
      })
    );

    return fixedSubjects;
  }
}
