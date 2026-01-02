import { UnknownConversationTypeError } from "@domain/errors";

export class ConversationType {
  private constructor(private readonly value: string) {}

  static readonly PRIVATE = new ConversationType("PRIVATE");
  static readonly GROUP = new ConversationType("GROUP");

  static fromString(value: string): ConversationType {
    switch (value.toUpperCase()) {
      case "PRIVATE":
        return ConversationType.PRIVATE;
      case "GROUP":
        return ConversationType.GROUP;
      default:
        throw new UnknownConversationTypeError(
          `Unknown conversation type: ${value}`
        );
    }
  }

  toString(): string {
    return this.value;
  }

  equals(other: ConversationType): boolean {
    return this.value === other.value;
  }

  isPrivate(): boolean {
    return this.equals(ConversationType.PRIVATE);
  }

  isGroup(): boolean {
    return this.equals(ConversationType.GROUP);
  }
}
