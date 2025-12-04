import { Account } from "@domain/entities/account";
export interface AccountRepository {
  save(account: Account): Promise<void>;
  findById(id: string): Promise<Account | null>;
  findByIBAN(IBAN: string): Promise<Account | null>;
  findByOwnerId(ownerId: string): Promise<Account[]>;
  updateBalance(accountId: string, newBalance: number): Promise<void>;
  updateStatus(accountId: string, status: string): Promise<void>;
  delete(accountId: string): Promise<void>;
}
