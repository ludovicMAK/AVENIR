import { TransactionRepository } from "@application/repositories/transaction";
import { Transaction } from "@domain/entities/transaction";
import { TransferRepository } from "@application/repositories/transfer";
import { Transfer } from "@domain/entities/transfer";
import { StatusTransaction } from "@domain/values/statusTransaction";
import { TransferCreationFailedError } from "@application/errors/index";
import { UnitOfWork } from "@application/services/UnitOfWork";
import { StatusTransfer } from "@domain/values/statusTransfer";
import { UserRepository } from "@application/repositories/users";
import { confirmTransfer } from "@application/requests/transfer";

export class ValidTransferByAdmin {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly transferRepository: TransferRepository,
    private readonly userRepository: UserRepository,
    private readonly unitOfWork: UnitOfWork
  ) {}
  
  async execute(input: confirmTransfer): Promise<void> {
    
    const userInformationConnected = await this.userRepository.getInformationUserConnected(input.userId, input.token);
    const transfer = await this.transferRepository.findById(input.idTransfer);
    if (!transfer) {
      throw new TransferCreationFailedError("Transfer not found.");
    }
    if (!userInformationConnected) {
      throw new TransferCreationFailedError("authentication failed: User not found.");
    }
    
    if (userInformationConnected.role.getValue() !== "bankManager" && userInformationConnected.role.getValue() !== "bankAdvisor") {
      throw new TransferCreationFailedError("Unauthorized: Only admin users can validate transfers.");
    }
    await this.unitOfWork.begin();
    try {
      const updatedTransfer = new Transfer(
        transfer.id,
        transfer.amount,
        transfer.dateRequested,
        transfer.dateExecuted, 
        transfer.description,
        StatusTransfer.VALIDATED 
      );

      const saveResult = await this.transferRepository.update(updatedTransfer, this.unitOfWork);
      if (!saveResult) {
        throw new TransferCreationFailedError("Failed to validate the transfer.");
      }
      const transactions = await this.transactionRepository.getAllTransactionsByTransferId(transfer.id);
      console.log("Transfer validated successfully:", transactions);

      for (const transaction of transactions) {
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
        await this.transactionRepository.update(updatedTransaction, this.unitOfWork);
      }
      await this.unitOfWork.commit();
    }catch (error) {
      await this.unitOfWork.rollback();
      throw error;
    }
    

  }
}
