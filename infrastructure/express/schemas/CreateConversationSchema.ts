import { z } from "zod";
import { uuid } from "./uuid";

export const CreateConversationSchema = z.object({
  customerId: uuid("Invalid customer ID format"),
  initialMessage: z
    .string()
    .min(1, "Initial message is required")
    .max(5000, "Message is too long"),
  assignedAdvisorId: uuid("Invalid advisor ID format").optional(),
  type: z.literal("private").optional().default("private"),
});

export type CreateConversationInput = z.infer<typeof CreateConversationSchema>;
