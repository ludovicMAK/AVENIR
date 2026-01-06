import { AccountType } from "@domain/values/accountType";
import { StatusAccount } from "@domain/values/statusAccount";
import { read } from "fs";

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
    readonly balance: number = 0,
    readonly availableBalance: number = 0
  ) {}
  canAfford(amount: number): boolean {
    const totalPower =
      this.availableBalance +
      (this.authorizedOverdraft ? this.overdraftLimit : 0);
    return totalPower >= amount;
  }

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

  getBlockedAmount(): number {
    return this.balance - this.availableBalance;
  }

  canBlockFunds(amount: number): boolean {
    return this.availableBalance >= amount;
  }

  hasEnoughAvailableBalance(amount: number): boolean {
    return this.availableBalance >= amount;
  }
}
