import { TransferRepository } from "@application/repositories/transfer";
import { Transfer } from "@domain/entities/transfer";
import { StatusTransfer } from "@domain/values/statusTransfer";
import { ConnectedError, NotFoundError, UnauthorizedError, TransferCreationFailedError } from "@application/errors/index";
import { UnitOfWork } from "@application/services/UnitOfWork";
import { UserRepository } from "@application/repositories/users";
import { AccountRepository } from "@application/repositories/account";
import { TransactionRepository } from "@application/repositories/transaction";

export type CancelTransferRequest = {
  userId: string;
  token: string;
  transferId: string;
};

export class CancelTransfer {
  constructor(
    private readonly transferRepository: TransferRepository,
    private readonly userRepository: UserRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly accountRepository: AccountRepository,
    private readonly unitOfWork: UnitOfWork
  ) {}

  async execute(input: CancelTransferRequest): Promise<void> {
    const userInformationConnected = await this.userRepository.getInformationUserConnected(input.userId, input.token);
    if (!userInformationConnected) {
      throw new ConnectedError("Authentication failed: User not found.");
    }

    const transfer = await this.transferRepository.findById(input.transferId);
    if (!transfer) {
      throw new NotFoundError("Transfer not found.");
    }

    if (!transfer.statusTransfer.equals(StatusTransfer.PENDING)) {
      throw new TransferCreationFailedError("Only pending transfers can be cancelled.");
    }

    const transactions = await this.transactionRepository.getAllTransactionsByTransferId(transfer.id);
    if (transactions.length === 0) {
      throw new NotFoundError("No transactions found for this transfer.");
    }

    const debitTransaction = transactions.find(t => t.transactionDirection.getValue() === "debit");
    if (!debitTransaction) {
      throw new NotFoundError("Source transaction not found.");
    }

    const sourceAccount = await this.accountRepository.findByIBAN(debitTransaction.accountIBAN);
    if (!sourceAccount) {
      throw new NotFoundError("Source account not found.");
    }

    if (sourceAccount.idOwner !== input.userId) {
      throw new UnauthorizedError("You are not authorized to cancel this transfer. Only the owner of the source account can cancel it.");
    }

    await this.unitOfWork.begin();
    try {
      const cancelledTransfer = new Transfer(
        transfer.id,
        transfer.amount,
        transfer.dateRequested,
        transfer.dateExecuted,
        transfer.description,
        StatusTransfer.CANCELLED
      );

      const updateResult = await this.transferRepository.update(cancelledTransfer, this.unitOfWork);
      if (!updateResult) {
        throw new TransferCreationFailedError("Failed to cancel the transfer.");
      }

      await this.unitOfWork.commit();
    } catch (error) {
      await this.unitOfWork.rollback();
      throw error;
    }
  }
}
