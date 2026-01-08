import { AccountRepository } from "@application/repositories/account";
import { Account } from "@domain/entities/account";
import { AccountType } from "@domain/values/accountType";
import { UnitOfWork } from "@application/services/UnitOfWork";
import { InMemoryUnitOfWork } from "@adapters/services/InMemoryUnitOfWork";

export class InMemoryAccountRepository implements AccountRepository {
  private readonly items: Map<string, Account> = new Map();

  async save(account: Account): Promise<void> {
    this.items.set(account.id, account);
  }

  async findById(id: string): Promise<Account | null> {
    return this.items.get(id) || null;
  }

  async findByIBAN(IBAN: string): Promise<Account | null> {
    for (const account of this.items.values()) {
      if (account.IBAN === IBAN) {
        return account;
      }
    }
    return null;
  }

  async findByOwnerId(ownerId: string): Promise<Account[]> {
    const accounts: Account[] = [];
    for (const account of this.items.values()) {
      if (account.idOwner === ownerId) {
        accounts.push(account);
      }
    }
    return accounts;
  }

  async updateBalance(
    accountId: string,
    amountToAdd: number,
    unitOfWork?: UnitOfWork
  ): Promise<void> {
    return this.applyChange(
      accountId,
      (account) =>
        new Account(
          account.id,
          account.accountType,
          account.IBAN,
          account.accountName,
          account.authorizedOverdraft,
          account.overdraftLimit,
          account.overdraftFees,
          account.status,
          account.idOwner,
          account.balance + amountToAdd,
          account.availableBalance
        ),
      unitOfWork
    );
  }

  async updateBalanceAvailable(
    accountId: string,
    amountToAdd: number,
    unitOfWork?: UnitOfWork
  ): Promise<void> {
    return this.applyChange(
      accountId,
      (account) =>
        new Account(
          account.id,
          account.accountType,
          account.IBAN,
          account.accountName,
          account.authorizedOverdraft,
          account.overdraftLimit,
          account.overdraftFees,
          account.status,
          account.idOwner,
          account.balance,
          account.availableBalance + amountToAdd
        ),
      unitOfWork
    );
  }

  async updateStatus(accountId: string, status: string): Promise<void> {
    const account = this.items.get(accountId);
    if (account) {
      const StatusAccount = await import("@domain/values/statusAccount").then(
        (m) => m.StatusAccount
      );
      const updatedAccount = new Account(
        account.id,
        account.accountType,
        account.IBAN,
        account.accountName,
        account.authorizedOverdraft,
        account.overdraftLimit,
        account.overdraftFees,
        StatusAccount.from(status),
        account.idOwner,
        account.balance,
        account.availableBalance
      );
      this.items.set(accountId, updatedAccount);
    }
  }

  async delete(accountId: string): Promise<void> {
    this.items.delete(accountId);
  }
  async findByIdAndUserId(id: string, userId: string): Promise<Account | null> {
    const account = this.items.get(id);
    if (account && account.idOwner === userId) {
      return account;
    }
    return null;
  }
  async findCurrentAccountByCustomerId(customerId: string): Promise<Account | null> {
    for (const account of this.items.values()) {
      if (account.idOwner === customerId && account.accountType.getValue() === "current") {
        return account;
      }
    }
    return null;
  }
  async findByType(accountType: AccountType): Promise<Account[]> {
    return Array.from(this.items.values()).filter((account) =>
      account.accountType.equals(accountType)
    );
  }
  async updateNameAccount(
    accountId: string,
    newName: string,
    unitOfWork?: UnitOfWork
  ): Promise<boolean> {
    const account = this.items.get(accountId);
    if (!account) {
      return false;
    }

    await this.applyChange(
      accountId,
      (existing) =>
        new Account(
          existing.id,
          existing.accountType,
          existing.IBAN,
          newName,
          existing.authorizedOverdraft,
          existing.overdraftLimit,
          existing.overdraftFees,
          existing.status,
          existing.idOwner,
          existing.balance,
          existing.availableBalance
        ),
      unitOfWork
    );

    return true;
  }

  async blockFunds(
    accountId: string,
    amount: number,
    unitOfWork?: UnitOfWork
  ): Promise<void> {
    return this.applyChange(
      accountId,
      (account) =>
        new Account(
          account.id,
          account.accountType,
          account.IBAN,
          account.accountName,
          account.authorizedOverdraft,
          account.overdraftLimit,
          account.overdraftFees,
          account.status,
          account.idOwner,
          account.balance,
          account.availableBalance - amount
        ),
      unitOfWork
    );
  }

  async unblockFunds(
    accountId: string,
    amount: number,
    unitOfWork?: UnitOfWork
  ): Promise<void> {
    return this.applyChange(
      accountId,
      (account) =>
        new Account(
          account.id,
          account.accountType,
          account.IBAN,
          account.accountName,
          account.authorizedOverdraft,
          account.overdraftLimit,
          account.overdraftFees,
          account.status,
          account.idOwner,
          account.balance,
          account.availableBalance + amount
        ),
      unitOfWork
    );
  }

  private async applyChange(
    accountId: string,
    mutation: (account: Account) => Account,
    unitOfWork?: UnitOfWork
  ): Promise<void> {
    const account = this.items.get(accountId);
    if (!account) {
      return;
    }

    const updatedAccount = mutation(account);

    if (unitOfWork instanceof InMemoryUnitOfWork) {
      unitOfWork.registerChange({
        execute: async () => {
          this.items.set(accountId, updatedAccount);
        },
      });
      return;
    }

    this.items.set(accountId, updatedAccount);
  }
}
