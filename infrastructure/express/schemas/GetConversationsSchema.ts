import { z } from "zod";

export const GetCustomerConversationsSchema = z.object({
  customerId: z.string().uuid("Invalid customer ID format"),
});

export const GetAdvisorConversationsSchema = z.object({
  advisorId: z.string().uuid("Invalid advisor ID format"),
});

export type GetCustomerConversationsInput = z.infer<
  typeof GetCustomerConversationsSchema
>;
export type GetAdvisorConversationsInput = z.infer<
  typeof GetAdvisorConversationsSchema
>;
