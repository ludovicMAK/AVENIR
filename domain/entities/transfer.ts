import { AccountType } from "@domain/values/accountType";
import { StatusAccount } from "@domain/values/statusAccount";
import { StatusTransfer } from "@domain/values/statusTransfer";

import { TransactionDirection } from "@domain/values/transactionDirection";
export class Transfer {
    constructor(
        readonly id: string,
        readonly amount: number,
        readonly dateRequested: Date,
        readonly dateExecuted: Date,
        readonly description: string,
        readonly statusTransfer: StatusTransfer,
        readonly transactionDirection: TransactionDirection,
        readonly reason: string
    ) {}
}