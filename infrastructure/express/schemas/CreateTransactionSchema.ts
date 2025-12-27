import zod from "zod"

export const CreateTransactionSchema = zod.object({
    description: zod.string().min(1, { message: "Description is required." }),
    amount: zod.number({ message: "Amount must be a number." }),
    accountIBANFrom: zod.string().min(1, { message: "Source account IBAN is required." }),
    accountIBANTo: zod.string().min(1, { message: "Destination account IBAN is required." }),
    direction: zod.enum(["INCOMING", "OUTGOING"], { message: "Direction must be either INCOMING or OUTGOING." }),
    dateExecuted: zod.string().refine((date) => !isNaN(Date.parse(date)), {
        message: "dateExecuted must be a valid date string.",
    }),
})
