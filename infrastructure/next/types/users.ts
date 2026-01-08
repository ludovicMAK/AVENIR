export type UserRole = "customer" | "bankManager" | "bankAdvisor";
export type UserStatus = "active" | "banned";

export type UserSummary = {
  id: string;
  firstname: string;
  lastname: string;
  role: UserRole;
  status: UserStatus;
};

export type UserWithStats = UserSummary & {
  accountsCount: number;
  openAccountsCount: number;
  totalBalance: number;
  totalAvailableBalance: number;
};
