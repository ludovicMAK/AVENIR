import { TransactionRepository } from "@application/repositories/transaction";
import { Transaction } from "@domain/entities/transaction";
import { TransferRepository } from "@application/repositories/transfer";
import { Transfer } from "@domain/entities/transfer";
import { StatusTransaction } from "@domain/values/statusTransaction";
import { ConnectedError, TransferCreationFailedError } from "@application/errors/index";
import { UnitOfWorkFactory } from "@application/services/UnitOfWork";
import { StatusTransfer } from "@domain/values/statusTransfer";
import { UserRepository } from "@application/repositories/users";
import { confirmTransfer } from "@application/requests/transfer";
import { AccountRepository } from "@application/repositories/account";
import { TransactionDirection } from "@domain/values/transactionDirection";

export class ValidTransferByAdmin {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly transferRepository: TransferRepository,
    private readonly userRepository: UserRepository,
    private readonly unitOfWorkFactory: UnitOfWorkFactory,
    private readonly accountRepository: AccountRepository
  ) {}
  
  async execute(input: confirmTransfer): Promise<void> {
    const userInformationConnected = await this.userRepository.getInformationUserConnected(input.userId, input.token);
    if (!userInformationConnected) {
      throw new ConnectedError("authentication failed: User not found.");
    }
    const transfer = await this.transferRepository.findById(input.idTransfer);
    if (!transfer) {
      throw new TransferCreationFailedError("Transfer not found.");
    }
    
    if (userInformationConnected.role.getValue() !== "bankManager" && userInformationConnected.role.getValue() !== "bankAdvisor") {
      throw new TransferCreationFailedError("Unauthorized: Only admin users can validate transfers.");
    }
    if(!transfer.statusTransfer.equals(StatusTransfer.PENDING)) {
      throw new TransferCreationFailedError("Only pending transfers can be validated.");
    }
    const unitOfWork = this.unitOfWorkFactory();
    await unitOfWork.begin();
    try {
      const updatedTransfer = new Transfer(
        transfer.id,
        transfer.amount,
        transfer.dateRequested,
        transfer.dateExecuted, 
        transfer.description,
        StatusTransfer.VALIDATED 
      );

      const saveResult = await this.transferRepository.update(updatedTransfer, unitOfWork);
      if (!saveResult) {
        throw new TransferCreationFailedError("Failed to validate the transfer.");
      }
      const transactions = await this.transactionRepository.getAllTransactionsByTransferId(transfer.id);

      for (const transaction of transactions) {
        const account = await this.accountRepository.findByIBAN(transaction.accountIBAN);
        if (!account) {
          throw new TransferCreationFailedError(`Account with IBAN ${transaction.accountIBAN} not found.`);
        }
        const adjustment = transaction.transactionDirection === TransactionDirection.DEBIT 
                           ? -transaction.amount 
                           : transaction.amount;
                           
        await this.accountRepository.updateBalance(account.id, adjustment, unitOfWork);
        const updatedTransaction = new Transaction(
          transaction.id,
          transaction.accountIBAN,
          transaction.transactionDirection,
          transaction.amount,
          transaction.reason,
          transaction.accountDate,
          StatusTransaction.VALIDATED,
          transaction.transferId
        );
        await this.transactionRepository.update(updatedTransaction, unitOfWork);
      }
      
      await unitOfWork.commit();
    }catch (error) {
      await unitOfWork.rollback();
      throw error;
    }
    

  }
}
