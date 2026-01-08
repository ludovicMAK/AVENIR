import { User } from "@domain/entities/users";

export type UserStats = {
  user: User;
  accountsCount: number;
  openAccountsCount: number;
  totalBalance: number;
  totalAvailableBalance: number;
};
