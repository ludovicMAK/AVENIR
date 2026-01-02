import zod from "zod"

export const CreateTransactionSchema = zod.object({
    
    description: zod.string().min(1, { message: "Description is required." }),
    amount: zod.number({ message: "Amount must be a number." }),
    accountIBANFrom: zod.string().min(1, { message: "Source account IBAN is required." }),
    accountIBANTo: zod.string().min(1, { message: "Destination account IBAN is required." }),
    direction: zod.enum(["debit", "credit"], { message: "Direction must be either debit or credit." }),
    dateExecuted: zod.string().refine((date) => !isNaN(Date.parse(date)), {
        message: "dateExecuted must be a valid date string.",
    }),
})
