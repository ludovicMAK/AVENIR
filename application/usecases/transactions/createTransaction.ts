import { TransactionInput } from "@application/requests/transaction";
import { TransactionRepository } from "@application/repositories/transaction";
import { Transaction } from "@domain/entities/transaction";
import { UuidGenerator } from "@application/services/UuidGenerator";
import { TransferRepository } from "@application/repositories/transfer";
import { Transfer } from "@domain/entities/transfer";
import { TransactionDirection } from "@domain/values/transactionDirection";
import { StatusTransaction } from "@domain/values/statusTransaction";
import { ConnectedError, NotFoundError, UnauthorizedError, UnprocessableError } from "@application/errors/index";
import { AccountRepository } from "@application/repositories/account";
import { UnitOfWork } from "@application/services/UnitOfWork";
import { StatusTransfer } from "@domain/values/statusTransfer";
import { SessionRepository } from "@application/repositories/session";

export class CreateTransaction {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly uuidGenerator: UuidGenerator,
    private readonly transferRepository: TransferRepository,
    private readonly accountRepository: AccountRepository,
    private readonly unitOfWork: UnitOfWork,
    private readonly sessionRepository: SessionRepository
  ) {}

  async execute(input: TransactionInput): Promise<string> {
    const connect = await this.sessionRepository.isConnected(input.idUser, input.token);
    if (!connect) throw new ConnectedError();

    const accountFrom = await this.accountRepository.findByIBAN(input.accountIBANFrom);
    const accountTo = await this.accountRepository.findByIBAN(input.accountIBANTo);
    
    if (!accountFrom || !accountTo) {
        throw new NotFoundError("Source or destination account not found.");
    }


    if (accountFrom.idOwner !== input.idUser) {
        throw new UnauthorizedError("You are not authorized to debit this account.");
    }

    if (!accountFrom.isOpen() || !accountTo.isOpen()) {
    throw new UnprocessableError("One of the accounts is not active.");
}

    if (!accountFrom.canAfford(input.amount)) {
    throw new UnprocessableError("Insufficient available balance (including overdraft).");
}



    const id = this.uuidGenerator.generate();
    const transfer = new Transfer(id, input.amount, new Date(), input.dateExecuted, input.description, StatusTransfer.PENDING);

    await this.unitOfWork.begin();
    try {
        await this.transferRepository.save(transfer, this.unitOfWork);


        const commonData = { transferId: transfer.id, amount: input.amount, description: input.description, date: input.dateExecuted };

        await this.transactionRepository.createTransaction(new Transaction(
            this.uuidGenerator.generate(), input.accountIBANFrom, TransactionDirection.DEBIT, 
            commonData.amount, commonData.description, commonData.date, StatusTransaction.POSTED, commonData.transferId
        ), this.unitOfWork);

        await this.transactionRepository.createTransaction(new Transaction(
            this.uuidGenerator.generate(), input.accountIBANTo, TransactionDirection.CREDIT, 
            commonData.amount, commonData.description, commonData.date, StatusTransaction.POSTED, commonData.transferId
        ), this.unitOfWork);

        await this.accountRepository.updateBalanceAvailable(accountFrom.id, -input.amount, this.unitOfWork);
        await this.accountRepository.updateBalanceAvailable(accountTo.id, input.amount, this.unitOfWork);

        await this.unitOfWork.commit();
        return transfer.id;
    } catch (error) {
        await this.unitOfWork.rollback();
        throw error;
    }
}
}
