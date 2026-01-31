import { z } from "zod";
import { uuid } from "./uuid";

export const TransferConversationSchema = z.object({
  conversationId: uuid("Invalid conversation ID format"),
  fromAdvisorId: uuid("Invalid from advisor ID format"),
  toAdvisorId: uuid("Invalid to advisor ID format"),
  reason: z
    .string()
    .min(1, "Transfer reason is required")
    .max(1000, "Reason is too long"),
});

export type TransferConversationInput = z.infer<
  typeof TransferConversationSchema
>;
