import { AccountRepository } from "@application/repositories/account";
import { Account } from "@domain/entities/account";
import { AccountType } from "@domain/values/accountType";
import { StatusAccount } from "@domain/values/statusAccount";

export class InMemoryAccountRepository implements AccountRepository {
  private readonly items: Map<string, Account> = new Map();
   

    
  async save(account: Account): Promise<void> {
    this.items.set(account.IBAN, account);
  }
  async findByIBAN(IBAN: string): Promise<Account | null> {
    return this.items.get(IBAN) || null;
  }
  async findByOwnerId(ownerId: string): Promise<Account[]> {
    const accounts: Account[] = [];
    console.log("Searching accounts for ownerId:", ownerId);
    console.log(
      "Current accounts in repository:",
      Array.from(this.items.values())
    );
    for (const account of this.items.values()) {
      if (account.idOwner === ownerId) {
        accounts.push(account);
      }
    }
    return accounts;
  }
  async createAccountForUser(userId: string, IBAN: string): Promise<void> {
    const newAccount = new Account(
      AccountType.CURRENT,
      IBAN,
      `compte courant`,
      false,
      StatusAccount.OPEN,
      userId
    );
    this.items.set(newAccount.IBAN, newAccount);
  }
}
