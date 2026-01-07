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

  async execute(input: TransactionInput): Promise<void> {
    const connect = await this.sessionRepository.isConnected(
      input.idUser,
      input.token
    );
    if (!connect) throw new ConnectedError();

    console.log(
      "[CreateTransaction UseCase] Searching for accounts with IBANs:",
      {
        accountIBANFrom: input.accountIBANFrom,
        accountIBANTo: input.accountIBANTo,
      }
    );

    const accountFrom = await this.accountRepository.findByIBAN(
      input.accountIBANFrom
    );
    const accountTo = await this.accountRepository.findByIBAN(
      input.accountIBANTo
    );

    console.log("[CreateTransaction UseCase] Accounts found:", {
      accountFrom: accountFrom
        ? { id: accountFrom.id, IBAN: accountFrom.IBAN }
        : null,
      accountTo: accountTo ? { id: accountTo.id, IBAN: accountTo.IBAN } : null,
    });

    if (!accountFrom || !accountTo) {
      throw new NotFoundError("Compte source ou destination introuvable.");
    }

    if (accountFrom.idOwner !== input.idUser) {
      throw new UnauthorizedError(
        "Vous n'êtes pas autorisé à débiter ce compte."
      );
    }

    if (!accountFrom.isOpen() || !accountTo.isOpen()) {
      throw new UnprocessableError("L'un des comptes n'est pas actif.");
    }

    if (!accountFrom.canAfford(input.amount)) {
      throw new UnprocessableError(
        "Solde disponible insuffisant (incluant le découvert)."
      );
    }

    const id = this.uuidGenerator.generate();
    const transfer = new Transfer(
      id,
      input.amount,
      new Date(),
      input.dateExecuted,
      input.description,
      StatusTransfer.VALIDATED
    );

    await this.unitOfWork.begin();
    try {
      await this.transferRepository.save(transfer, this.unitOfWork);

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
        this.unitOfWork
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
        this.unitOfWork
      );

      await this.accountRepository.updateBalanceAvailable(
        accountFrom.id,
        -input.amount,
        this.unitOfWork
      );
      await this.accountRepository.updateBalanceAvailable(
        accountTo.id,
        input.amount,
        this.unitOfWork
      );

      await this.unitOfWork.commit();
      console.log("[CreateTransaction] Successfully committed transfer:", {
        transferId: transfer.id,
        amount: input.amount,
        from: input.accountIBANFrom,
        to: input.accountIBANTo,
      });
    } catch (error) {
      console.error(
        "[CreateTransaction] Transaction failed, rolling back:",
        error
      );
      await this.unitOfWork.rollback();
      throw error;
    }
  }
}
