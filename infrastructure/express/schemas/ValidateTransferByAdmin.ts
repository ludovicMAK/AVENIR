import zod from "zod"

export const ValidateTransferByAdmin = zod.object({
    userId: zod.string().min(1, { message: "User ID is required." }),
    token: zod.string().min(1, { message: "Token is required." }),
    idTransfer : zod.string().min(1, { message: "Transfer ID is required." }),
})
