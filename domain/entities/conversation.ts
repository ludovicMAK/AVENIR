import { ConversationStatus } from "@domain/values/conversationStatus";
import { ConversationType } from "@domain/values/conversationType";

export class Conversation {
  constructor(
    readonly id: string,
    readonly subject: string,
    readonly status: ConversationStatus,
    readonly type: ConversationType,
    readonly dateOuverture: Date,
    readonly customerId: string | null
  ) {}

  isOpen(): boolean {
    return this.status.isOpen();
  }

  isTransferred(): boolean {
    return this.status.isTransferred();
  }

  isClosed(): boolean {
    return this.status.isClosed();
  }

  canReceiveMessages(): boolean {
    return !this.isClosed();
  }
}
