import { UnknownCreditModeError } from "@domain/errors";

export class CreditMode {
  private constructor(private readonly value: "daily" | "monthly") {}

  static readonly DAILY: CreditMode = new CreditMode("daily");
  static readonly MONTHLY: CreditMode = new CreditMode("monthly");

  static from(value: string): CreditMode {
    switch (value) {
      case "daily":
        return CreditMode.DAILY;
      case "monthly":
        return CreditMode.MONTHLY;
      default:
        throw new UnknownCreditModeError(value);
    }
  }

  getValue(): string {
    return this.value;
  }

  equals(other: CreditMode): boolean {
    return this.value === other.value;
  }
}
