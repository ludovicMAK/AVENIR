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

export class CreateTransaction {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly uuidGenerator: UuidGenerator,
    private readonly transferRepository: TransferRepository,
    private readonly accountRepository: AccountRepository,
    private readonly unitOfWork: UnitOfWork
  ) {}

  async execute(input: TransactionInput): Promise<void> {
    const idFrom = this.uuidGenerator.generate();
    const idTo = this.uuidGenerator.generate();
    const id = this.uuidGenerator.generate();
    
    const transfer = new Transfer(
      id,
      input.amount,
      new Date(),
      input.dateExecuted,
      input.description
    );

    const accountFrom = await this.accountRepository.findByIBAN(input.accountIBANFrom);
    const accountTo = await this.accountRepository.findByIBAN(input.accountIBANTo);
    
    if (!accountFrom || !accountTo) {
      throw new TransferCreationFailedError(
        "Compte source ou destination introuvable pour les IBANs fournis."
      );
    }

    await this.unitOfWork.begin();

    try {
      const transferSaved = await this.transferRepository.save(transfer, this.unitOfWork);
      if (!transferSaved) {
        throw new TransferCreationFailedError(
          "Échec de l'enregistrement du transfert pour le montant : " +
            input.amount
        );
      }

      if (TransactionDirection.from(input.direction).equals(TransactionDirection.DEBIT)) {
        const transactionFrom = new Transaction(
          idFrom,
          input.accountIBANFrom,
          TransactionDirection.DEBIT,
          input.amount,
          input.description,
          input.dateExecuted,
          StatusTransaction.PENDING,
          transfer.id
        );
        await this.transactionRepository.createTransaction(transactionFrom, this.unitOfWork);

        const transactionTo = new Transaction(
          idTo,
          input.accountIBANTo,
          TransactionDirection.CREDIT,
          input.amount,
          input.description,
          input.dateExecuted,
          StatusTransaction.PENDING,
          transfer.id
        );
        await this.transactionRepository.createTransaction(transactionTo, this.unitOfWork);
      }
      if (
        TransactionDirection.from(input.direction).equals(TransactionDirection.CREDIT)) {
        const transactionTo = new Transaction(
          idTo,
          input.accountIBANTo,
          TransactionDirection.CREDIT,
          input.amount,
          input.description,
          input.dateExecuted,
          StatusTransaction.PENDING,
          transfer.id
        );
        await this.transactionRepository.createTransaction(transactionTo, this.unitOfWork);

        const transactionFrom = new Transaction(
          idFrom,
          input.accountIBANFrom,
          TransactionDirection.DEBIT,
          input.amount,
          input.description,
          input.dateExecuted,
          StatusTransaction.PENDING,
          transfer.id
        );
        await this.transactionRepository.createTransaction(transactionFrom, this.unitOfWork);
      }

      await this.unitOfWork.commit();
    } catch (error) {
      await this.unitOfWork.rollback();
      throw new TransferCreationFailedError(
        "Échec de la création du transfer et des transactions : " +
          (error instanceof Error ? error.message : String(error))
      );
    }
  }
}
