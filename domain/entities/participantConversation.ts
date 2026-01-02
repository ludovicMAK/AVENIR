export class ParticipantConversation {
  constructor(
    readonly id: string,
    readonly conversationId: string,
    readonly advisorId: string,
    readonly dateAdded: Date,
    readonly dateEnd: Date | null,
    readonly estPrincipal: boolean
  ) {}

  isActive(): boolean {
    return this.dateEnd === null;
  }

  isPrincipal(): boolean {
    return this.estPrincipal;
  }

  canSendMessages(): boolean {
    return this.isActive();
  }
}
