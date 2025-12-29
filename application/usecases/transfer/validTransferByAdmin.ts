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
import { UserRepository } from "@application/repositories/users";
import { confirmTransfer } from "@application/requests/transfer";

export class ValidTransferByAdmin {
  constructor(
    //private readonly transactionRepository: TransactionRepository,
    //private readonly transferRepository: TransferRepository,
    //private readonly accountRepository: AccountRepository,
    private readonly userRepository: UserRepository
  ) {}

  async execute(input: confirmTransfer): Promise<void> {
    const userInformationConnected = await this.userRepository.getInformationUserConnected(input.userId, input.token);
    console.log("User Information Connected:", userInformationConnected);
    if (!userInformationConnected || userInformationConnected.role.getValue() !== "admin") {
      throw new TransferCreationFailedError("Unauthorized: Only admin users can validate transfers.");
    }
  }
}
