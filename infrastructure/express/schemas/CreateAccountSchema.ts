import { z } from "zod";

export const createAccountSchema = z.object({
  accountType: z.enum(["current", "savings", "trading"], {
    message: "Account type must be 'current', 'savings', or 'trading'",
  }),
  accountName: z.string().min(1, "Account name is required"),
  authorizedOverdraft: z.boolean().default(false),
  overdraftLimit: z
    .number()
    .min(0, "Overdraft limit must be positive")
    .default(0),
  overdraftFees: z
    .number()
    .min(0, "Overdraft fees must be positive")
    .default(0),
  idOwner: z.string().uuid("Invalid owner ID format"),
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
