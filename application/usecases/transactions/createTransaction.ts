import { TransactionInput } from "@application/requests/transaction";
import { TransactionRepository } from "@application/repositories/transaction";
import { Transaction } from "@domain/entities/transaction";
import { UuidGenerator } from "@application/services/UuidGenerator";
import { TransferRepository } from "@application/repositories/transfer";
import { Transfer } from "@domain/entities/transfer";
import { TransactionDirection } from "@domain/values/transactionDirection";
import { StatusTransaction } from "@domain/values/statusTransaction";
import {
  ConnectedError,
  NotFoundError,
  UnauthorizedError,
  UnprocessableError,
} from "@application/errors/index";
import { AccountRepository } from "@application/repositories/account";
import { UnitOfWorkFactory } from "@application/services/UnitOfWork";
import { StatusTransfer } from "@domain/values/statusTransfer";
import { SessionRepository } from "@application/repositories/session";

export class CreateTransaction {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly uuidGenerator: UuidGenerator,
    private readonly transferRepository: TransferRepository,
    private readonly accountRepository: AccountRepository,
    private readonly unitOfWorkFactory: UnitOfWorkFactory,
    private readonly sessionRepository: SessionRepository
  ) {}

  async execute(input: TransactionInput): Promise<void> {
    const connect = await this.sessionRepository.isConnected(
      input.idUser,
      input.token
    );
    if (!connect) throw new ConnectedError();

    const accountFrom = await this.accountRepository.findByIBAN(
      input.accountIBANFrom
    );
    const accountTo = await this.accountRepository.findByIBAN(
      input.accountIBANTo
    );

    if (!accountFrom || !accountTo) {
      throw new NotFoundError("Source or destination account not found.");
    }

    if (accountFrom.idOwner !== input.idUser) {
      throw new UnauthorizedError(
        "You are not authorized to debit this account."
      );
    }

    if (!accountFrom.isOpen() || !accountTo.isOpen()) {
      throw new UnprocessableError("One of the accounts is not active.");
    }

    if (!accountFrom.canAfford(input.amount)) {
      throw new UnprocessableError(
        "Insufficient available balance (including overdraft)."
      );
    }

    const id = this.uuidGenerator.generate();
    const transfer = new Transfer(
      id,
      input.amount,
      new Date(),
      input.dateExecuted,
      input.description,
      StatusTransfer.VALIDATED,
      TransactionDirection.DEBIT,
      "" // Add a default empty string for 'reason' or replace with appropriate value
    );

    const unitOfWork = this.unitOfWorkFactory();
    await unitOfWork.begin();
    try {
      await this.transferRepository.save(transfer, unitOfWork);

      const commonData = {
        transferId: transfer.id,
        amount: input.amount,
        description: input.description,
        date: input.dateExecuted,
      };

      await this.transactionRepository.createTransaction(
        new Transaction(
          this.uuidGenerator.generate(),
          accountFrom.IBAN,
          TransactionDirection.DEBIT,
          commonData.amount,
          commonData.description,
          commonData.date,
          StatusTransaction.POSTED,
          commonData.transferId
        ),
        unitOfWork
      );

      await this.transactionRepository.createTransaction(
        new Transaction(
          this.uuidGenerator.generate(),
          accountTo.IBAN,
          TransactionDirection.CREDIT,
          commonData.amount,
          commonData.description,
          commonData.date,
          StatusTransaction.POSTED,
          commonData.transferId
        ),
        unitOfWork
      );

      await this.accountRepository.updateBalanceAvailable(
        accountFrom.id,
        -input.amount,
        unitOfWork
      );
      await this.accountRepository.updateBalanceAvailable(
        accountTo.id,
        input.amount,
        unitOfWork
      );

      await unitOfWork.commit();
    } catch (error) {
      await unitOfWork.rollback();
      throw error;
    }
  }
}
