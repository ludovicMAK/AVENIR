import { RegisterUserInput } from "@application/requests/auth"
import { AccountRepository } from "@application/repositories/account"
import { ownerIdInput } from "@application/requests/accounts"
import { TransactionInput } from "@application/requests/transaction";
import { TransactionRepository } from "@application/repositories/transaction";
import { Transaction } from "@domain/entities/transaction";
import { UuidGenerator } from "@application/services/UuidGenerator";
import { TransferRepository } from "@application/repositories/transfer";
import { Transfer } from "@domain/entities/transfer";

export class CreateTransaction {
    constructor(
        private readonly transactionRepository: TransactionRepository,
        private readonly uuidGenerator: UuidGenerator,
        private readonly transferRepository: TransferRepository,
        
    ) {}

    async execute(input: TransactionInput): Promise<void> {
        const id = this.uuidGenerator.generate();
        const transfer = new Transfer(id, input.account, input.amount, input.description);
        await this.transferRepository.save(transfer);
        const transaction = new Transaction(id, input.accountIBAN,input.direction, input.amount, input.description)
        await this.transactionRepository.createTransaction(input)
    }
}