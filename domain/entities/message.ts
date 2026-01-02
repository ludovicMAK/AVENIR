export class Message {
  constructor(
    readonly id: string,
    readonly conversationId: string,
    readonly senderId: string,
    readonly senderRole: string, // "customer", "bankAdvisor", "bankManager"
    readonly text: string,
    readonly sendDate: Date
  ) {}

  isRecent(): boolean {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    return this.sendDate > oneDayAgo;
  }

  isFromManager(): boolean {
    return this.senderRole === "bankManager";
  }
}
