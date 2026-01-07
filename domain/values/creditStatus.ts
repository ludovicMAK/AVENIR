import { UnknownCreditStatusError } from "@domain/errors"

export class CreditStatus {
    private constructor(private readonly value: "in_progress" | "completed") {}

    static readonly IN_PROGRESS: CreditStatus = new CreditStatus("in_progress")
    static readonly COMPLETED: CreditStatus = new CreditStatus("completed")
    
    static from(value: string): CreditStatus {
        switch (value) {
            case "in_progress":
                return CreditStatus.IN_PROGRESS
            case "completed":
                return CreditStatus.COMPLETED
            default:
                throw new UnknownCreditStatusError(value)
        }
    }

    getValue(): string {
        return this.value
    }

    equals(other: CreditStatus): boolean {
        return this.value === other.value
    }
}
