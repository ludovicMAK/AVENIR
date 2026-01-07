import { AccountRepository } from "@application/repositories/account";
import { UnitOfWork } from "@application/services/UnitOfWork";
import { Account } from "@domain/entities/account";

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

  async updateBalance(accountId: string, newAvailableBalance: number, _unitOfWork?: UnitOfWork): Promise<void> {
    const account = this.items.get(accountId);
    if (account) {
      const nextBalance = account.balance + newAvailableBalance;
      const updatedAccount = new Account(
        account.id,
        account.accountType,
        account.IBAN,
        account.accountName,
        account.authorizedOverdraft,
        account.overdraftLimit,
        account.overdraftFees,
        account.status,
        account.idOwner,
        nextBalance,
        account.availableBalance
      );
      this.items.set(accountId, updatedAccount);
    }
  }

  async updateBalanceAvailable(
    accountId: string,
    newAvailableBalance: number
  ): Promise<void> {
    const account = this.items.get(accountId);
    if (account) {
      const nextAvailableBalance = account.availableBalance + newAvailableBalance;
      const updatedAccount = new Account(
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
        nextAvailableBalance
      );
      this.items.set(accountId, updatedAccount);
    }
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
  async updateNameAccount(accountId: string, newName: string): Promise<boolean> {
    const account = this.items.get(accountId);
    if (account) {
      const updatedAccount = new Account(
        account.id,
        account.accountType,
        account.IBAN,
        newName,
        account.authorizedOverdraft,
        account.overdraftLimit,
        account.overdraftFees,
        account.status,
        account.idOwner,
        account.balance,
        account.availableBalance
      );
      this.items.set(accountId, updatedAccount);
      return true;
    }
    return false;
  }

  async blockFunds(accountId: string, amount: number): Promise<void> {
    const account = this.items.get(accountId);
    if (account && account.isOpen()) {
      const updatedAccount = new Account(
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
      );
      this.items.set(accountId, updatedAccount);
    }
  }

  async unblockFunds(accountId: string, amount: number): Promise<void> {
    const account = this.items.get(accountId);
    if (account && account.isOpen()) {
      const updatedAccount = new Account(
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
      );
      this.items.set(accountId, updatedAccount);
    }
  }
}
