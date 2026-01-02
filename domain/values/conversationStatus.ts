import { UnknownConversationStatusError } from "@domain/errors";

export class ConversationStatus {
  private constructor(
    private readonly value: "open" | "transferred" | "closed"
  ) {}

  static readonly OPEN: ConversationStatus = new ConversationStatus("open");
  static readonly TRANSFERRED: ConversationStatus = new ConversationStatus(
    "transferred"
  );
  static readonly CLOSED: ConversationStatus = new ConversationStatus("closed");

  static from(value: string): ConversationStatus {
    switch (value) {
      case "open":
        return ConversationStatus.OPEN;
      case "transferred":
        return ConversationStatus.TRANSFERRED;
      case "closed":
        return ConversationStatus.CLOSED;
      default:
        throw new UnknownConversationStatusError(value);
    }
  }

  toString(): string {
    return this.value;
  }

  equals(other: ConversationStatus): boolean {
    return this.value === other.value;
  }

  isOpen(): boolean {
    return this.value === "open";
  }

  isTransferred(): boolean {
    return this.value === "transferred";
  }

  isClosed(): boolean {
    return this.value === "closed";
  }
}
