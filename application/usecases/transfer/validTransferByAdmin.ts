import { TransactionInput } from "@application/requests/transaction";
import { TransactionRepository } from "@application/repositories/transaction";
import { Transaction } from "@domain/entities/transaction";
import { UuidGenerator } from "@application/services/UuidGenerator";
import { TransferRepository } from "@application/repositories/transfer";
import { Transfer } from "@domain/entities/transfer";
import { TransactionDirection } from "@domain/values/transactionDirection";
import { StatusTransaction } from "@domain/values/statusTransaction";
import { TransferCreationFailedError } from "@application/errors/index";
import { AccountRepository } from "@application/repositories/account";
import { UnitOfWork } from "@application/services/UnitOfWork";
import { StatusTransfer } from "@domain/values/statusTransfer";

export class ValidTransferByAdmin {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly transferRepository: TransferRepository,
    private readonly accountRepository: AccountRepository,
    private readonly unitOfWork: UnitOfWork
  ) {}

  async execute(input: TransactionInput): Promise<void> {
   
  }
}
