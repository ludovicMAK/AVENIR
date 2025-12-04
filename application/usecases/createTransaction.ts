import { TransactionInput } from "@application/requests/transaction";
import { TransactionRepository } from "@application/repositories/transaction";
import { Transaction } from "@domain/entities/transaction";
import { UuidGenerator } from "@application/services/UuidGenerator";
import { TransferRepository } from "@application/repositories/transfer";
import { Transfer } from "@domain/entities/transfer";
import { Direction } from "@domain/values/direction";
import { StatusTransaction } from "@domain/values/statusTransaction";
import { TransferCreationFailedError } from "@application/errors/transferCreationFailedError";
import { AccountRepository } from "@application/repositories/account";

export class CreateTransaction {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly uuidGenerator: UuidGenerator,
    private readonly transferRepository: TransferRepository,
    private readonly accountRepository: AccountRepository
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
    const transferInserted = await this.transferRepository.save(transfer);
    if (!transferInserted) {
      throw new TransferCreationFailedError(
        "Échec de l'enregistrement du transfert pour le montant : " +
          input.amount
      );
    }
    const accountFrom = await this.accountRepository.findByIBAN(input.accountIBANFrom);
    const accountTo = await this.accountRepository.findByIBAN(input.accountIBANTo);
    if (!accountFrom || !accountTo) {
      throw new TransferCreationFailedError(
        "Compte source ou destination introuvable pour les IBANs fournis."
      );
    }

    if (Direction.from(input.direction).equals(Direction.DEBIT)) {
      const transactionFrom = new Transaction(
        idFrom,
        input.accountIBANFrom,
        Direction.DEBIT,
        input.amount,
        input.description,
        input.dateExecuted,
        StatusTransaction.PENDING,
        transfer.id
      );
      await this.transactionRepository.createTransaction(transactionFrom);
      const transactionTo = new Transaction(
        idTo,
        input.accountIBANTo,
        Direction.CREDIT,
        input.amount,
        input.description,
        input.dateExecuted,
        StatusTransaction.PENDING,
        transfer.id
      );
      await this.transactionRepository.createTransaction(transactionTo);
      return;
    }
    if (Direction.from(input.direction).equals(Direction.CREDIT)) {
      const transactionTo = new Transaction(
        idTo,
        input.accountIBANTo,
        Direction.CREDIT,
        input.amount,
        input.description,
        input.dateExecuted,
        StatusTransaction.PENDING,
        transfer.id
      );
      await this.transactionRepository.createTransaction(transactionTo);
      const transactionFrom = new Transaction(
        idFrom,
        input.accountIBANFrom,
        Direction.DEBIT,
        input.amount,
        input.description,
        input.dateExecuted,
        StatusTransaction.PENDING,
        transfer.id
      );
      await this.transactionRepository.createTransaction(transactionFrom);
      return;
    }
  }
}
