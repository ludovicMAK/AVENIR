import { AccountType } from "@domain/values/accountType";
import { StatusAccount } from "@domain/values/statusAccount";

export class Account {
  constructor(
    readonly id: string,
    readonly accountType: AccountType,
    readonly IBAN: string,
    readonly accountName: string,
    readonly authorizedOverdraft: boolean,
    readonly overdraftLimit: number,
    readonly overdraftFees: number,
    readonly status: StatusAccount,
    readonly idOwner: string,
    readonly balance: number = 0
  ) {}

  isOpen(): boolean {
    return this.status.getValue() === "open";
  }

  isClosed(): boolean {
    return this.status.getValue() === "close";
  }

  canBeClosed(): boolean {
    return this.balance === 0;
  }

  hasOverdraft(): boolean {
    return this.authorizedOverdraft;
  }

  getAvailableBalance(): number {
    if (this.authorizedOverdraft) {
      return this.balance + this.overdraftLimit;
    }
    return this.balance;
  }

  canWithdraw(amount: number): boolean {
    return this.getAvailableBalance() >= amount;
  }
}
