export class TransferConversation {
  constructor(
    readonly id: string,
    readonly conversationId: string,
    readonly fromAdvisorId: string,
    readonly toAdvisorId: string,
    readonly reason: string,
    readonly transferDate: Date
  ) {}

  isRecent(): boolean {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    return this.transferDate > oneDayAgo;
  }
}
