import { UnitOfWork } from "@application/services/UnitOfWork";
import { Account } from "@domain/entities/account";
import { AccountType } from "@domain/values/accountType";
export interface AccountRepository {
  save(account: Account): Promise<void>;
  findById(id: string): Promise<Account | null>;
  findByIdAndUserId(id: string, userId: string): Promise<Account | null>;
  findByIBAN(IBAN: string): Promise<Account | null>;
  findByOwnerId(ownerId: string): Promise<Account[]>;
  updateBalance(
    accountId: string,
    newBalance: number,
    unitOfWork?: UnitOfWork
  ): Promise<void>;
  updateStatus(accountId: string, status: string): Promise<void>;
  delete(accountId: string): Promise<void>;
  updateNameAccount(accountId: string, newName: string): Promise<boolean>;
  updateBalanceAvailable(
    accountId: string,
    newAvailableBalance: number,
    unitOfWork?: UnitOfWork
  ): Promise<void>;
  blockFunds(
    accountId: string,
    amount: number,
    unitOfWork?: UnitOfWork
  ): Promise<void>;
  unblockFunds(
    accountId: string,
    amount: number,
    unitOfWork?: UnitOfWork
  ): Promise<void>;
  findCurrentAccountByCustomerId(customerId: string): Promise<Account | null>;
  findByType(accountType: AccountType): Promise<Account[]>;
}
