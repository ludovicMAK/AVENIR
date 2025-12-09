import { AccountRepository } from "@application/repositories/account";
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

  async updateBalance(accountId: string, newBalance: number): Promise<void> {
    const account = this.items.get(accountId);
    if (account) {
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
        newBalance
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
        account.balance
      );
      this.items.set(accountId, updatedAccount);
    }
  }
  createAccountForUser(userId: string, IBAN: string): Promise<void> {
    return Promise.resolve();
  }

  async delete(accountId: string): Promise<void> {
    this.items.delete(accountId);
  }
}
