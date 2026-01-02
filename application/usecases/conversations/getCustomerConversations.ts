import { ConversationRepository } from "@application/repositories/conversation";
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

    return conversations;
  }
}
