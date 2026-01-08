export type UserRole = "customer" | "bankManager" | "bankAdvisor";

export type UserSummary = {
  id: string;
  firstname: string;
  lastname: string;
  role: UserRole;
};
