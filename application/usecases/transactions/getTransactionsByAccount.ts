import { TransactionRepository } from "@application/repositories/transaction";
import { AccountRepository } from "@application/repositories/account";
import { SessionRepository } from "@application/repositories/session";
import { AccountNotFoundError, ConnectedError, UnauthorizedError } from "@application/errors";
import { Transaction } from "@domain/entities/transaction";

export type GetTransactionsByAccountInput = {
    accountId: string;
    userId: string;
    token: string;
};

export type TransactionHistoryItem = {
    id: string;
    direction: string;
    amount: number;
    name: string;
    executedAt: Date;
    status: string;
    transferId: string;
    counterpartyIban?: string;
};

export class GetTransactionsByAccount {
    constructor(
        private readonly transactionRepository: TransactionRepository,
        private readonly accountRepository: AccountRepository,
        private readonly sessionRepository: SessionRepository
    ) {}

    async execute(input: GetTransactionsByAccountInput): Promise<TransactionHistoryItem[]> {
        const isConnected = await this.sessionRepository.isConnected(
            input.userId,
            input.token
        );
        if (!isConnected) {
            throw new ConnectedError("User is not connected");
        }

        const account = await this.accountRepository.findByIdAndUserId(
            input.accountId,
            input.userId
        );
        if (!account) {
            throw new AccountNotFoundError();
        }

        const transactions = await this.transactionRepository.findByAccountIban(account.IBAN);
        const transferIds = Array.from(new Set(transactions.map((t) => t.transferId)));

        const transferMap = new Map<string, Transaction[]>();
        for (const transferId of transferIds) {
            const related = await this.transactionRepository.getAllTransactionsByTransferId(transferId);
            transferMap.set(transferId, related);
        }

        return transactions.map((transaction) => {
            const related = transferMap.get(transaction.transferId) ?? [];
            const counterparty = related.find((t) => t.accountIBAN !== transaction.accountIBAN);

            return {
                id: transaction.id,
                direction: transaction.transactionDirection.getValue(),
                amount: transaction.amount,
                name: transaction.reason,
                executedAt: transaction.accountDate,
                status: transaction.status.getValue(),
                transferId: transaction.transferId,
                counterpartyIban: counterparty?.accountIBAN,
            };
        });
    }
}
