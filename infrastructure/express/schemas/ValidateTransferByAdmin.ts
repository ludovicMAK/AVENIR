import zod from "zod"

export const ValidateTransferByAdmin = zod.object({
    idTransfer : zod.string().min(1, { message: "Transfer ID is required." }),
})
