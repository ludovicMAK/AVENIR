import { z } from "zod";

export const TransferConversationSchema = z.object({
  conversationId: z.string().uuid("Invalid conversation ID format"),
  fromAdvisorId: z.string().uuid("Invalid from advisor ID format"),
  toAdvisorId: z.string().uuid("Invalid to advisor ID format"),
  reason: z
    .string()
    .min(1, "Transfer reason is required")
    .max(1000, "Reason is too long"),
});

export type TransferConversationInput = z.infer<
  typeof TransferConversationSchema
>;
