import { Credit } from "@domain/entities/credit";
import { DueDate } from "@domain/entities/dueDate";
import { DueDateStatus } from "@domain/values/dueDateStatus";
import { CreditStatus } from "@domain/values/creditStatus";
import { Transfer } from "@domain/entities/transfer";
import { Transaction } from "@domain/entities/transaction";
import { TransactionDirection } from "@domain/values/transactionDirection";
import { StatusTransaction } from "@domain/values/statusTransaction";
import { StatusTransfer } from "@domain/values/statusTransfer";
import { SessionRepository } from "@application/repositories/session";
import { DueDateRepository } from "@application/repositories/dueDate";
import { AccountRepository } from "@application/repositories/account";
import { TransactionRepository } from "@application/repositories/transaction";
import { TransferRepository } from "@application/repositories/transfer";
import { CreditRepository } from "@application/repositories/credit";
import { UnitOfWork } from "@application/services/UnitOfWork";
import { UuidGenerator } from "@application/services/UuidGenerator";
import { BankConfiguration } from "@application/services/BankConfiguration";
import { EarlyRepaymentRequest } from "@application/requests/credit";
import { EarlyRepaymentResult } from "@domain/types/EarlyRepaymentResult";
import { ConnectedError, NotFoundError, ValidationError } from "@application/errors";

export class EarlyRepayCredit {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly dueDateRepository: DueDateRepository,
    private readonly accountRepository: AccountRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly transferRepository: TransferRepository,
    private readonly creditRepository: CreditRepository,
    private readonly unitOfWork: UnitOfWork,
    private readonly uuidGenerator: UuidGenerator,
    private readonly bankConfiguration: BankConfiguration
  ) {}

  async execute(request: EarlyRepaymentRequest): Promise<EarlyRepaymentResult> {
    const isConnected = await this.sessionRepository.isConnected(request.customerId, request.token);
    if (!isConnected) throw new ConnectedError("Customer is not connected");

    const credit = await this.creditRepository.findById(request.creditId);
    if (!credit) throw new NotFoundError("Credit not found");

    if (credit.customerId !== request.customerId) {
      throw new ValidationError("This credit does not belong to the customer");
    }

    if (credit.status.equals(CreditStatus.COMPLETED)) {
      throw new ValidationError("This credit is already completed");
    }

    const dueDates = await this.dueDateRepository.findByCreditId(credit.id);

    const unpaidDueDates = dueDates.filter((dd) => !dd.isPaid());
    const totalAmountRemaining = unpaidDueDates.reduce((sum, dd) => sum + Number(dd.totalAmount), 0);

    if (totalAmountRemaining === 0) {
      throw new ValidationError("No remaining amount to repay");
    }

    const customerAccount = await this.accountRepository.findCurrentAccountByCustomerId(request.customerId);
    if (!customerAccount) throw new NotFoundError("Customer main account not found");

    const bankAccountIBAN = this.bankConfiguration.getBankAccountIBAN();
    const bankAccount = await this.accountRepository.findByIBAN(bankAccountIBAN);
    if (!bankAccount) throw new NotFoundError("Bank account not found");

    if (customerAccount.availableBalance < totalAmountRemaining) {
      throw new ValidationError("Insufficient balance for early repayment");
    }

    await this.unitOfWork.begin();
    try {
      const transferId = this.uuidGenerator.generate();
      const transfer = new Transfer(
        transferId,
        totalAmountRemaining,
        new Date(),
        new Date(),
        `Early repayment for credit ${credit.id}`,
        StatusTransfer.VALIDATED
      );

      await this.transferRepository.save(transfer, this.unitOfWork);

      const debitTransactionId = this.uuidGenerator.generate();
      const debitTransaction = new Transaction(
        debitTransactionId,
        customerAccount.IBAN,
        TransactionDirection.DEBIT,
        totalAmountRemaining,
        `Early repayment for credit ${credit.id}`,
        new Date(),
        StatusTransaction.POSTED,
        transferId
      );

      await this.transactionRepository.createTransaction(debitTransaction, this.unitOfWork);

      const creditTransactionId = this.uuidGenerator.generate();
      const creditTransaction = new Transaction(
        creditTransactionId,
        bankAccount.IBAN,
        TransactionDirection.CREDIT,
        totalAmountRemaining,
        `Early repayment for credit ${credit.id}`,
        new Date(),
        StatusTransaction.POSTED,
        transferId
      );

      await this.transactionRepository.createTransaction(creditTransaction, this.unitOfWork);

      for (const dueDate of unpaidDueDates) {
        const cancelledDueDate = new DueDate(
          dueDate.id,
          dueDate.dueDate,
          dueDate.totalAmount,
          dueDate.shareInterest,
          dueDate.shareInsurance,
          dueDate.repaymentPortion,
          DueDateStatus.CANCELLED,
          dueDate.creditId,
          undefined,
          undefined
        );
        await this.dueDateRepository.update(cancelledDueDate, this.unitOfWork);
      }

      await this.accountRepository.updateBalance(customerAccount.id, -totalAmountRemaining, this.unitOfWork);
      await this.accountRepository.updateBalanceAvailable(customerAccount.id, -totalAmountRemaining, this.unitOfWork);
      await this.accountRepository.updateBalance(bankAccount.id, totalAmountRemaining, this.unitOfWork);
      await this.accountRepository.updateBalanceAvailable(bankAccount.id, totalAmountRemaining, this.unitOfWork);

      const completedCredit = new Credit(
        credit.id,
        credit.amountBorrowed,
        credit.annualRate,
        credit.insuranceRate,
        credit.durationInMonths,
        credit.startDate,
        CreditStatus.COMPLETED,
        credit.customerId
      );
      await this.creditRepository.update(completedCredit, this.unitOfWork);

      await this.unitOfWork.commit();

      return {
        credit: completedCredit,
        totalAmountPaid: totalAmountRemaining,
        cancelledDueDates: unpaidDueDates.length,
        transfer,
      };
    } catch (error) {
      await this.unitOfWork.rollback();
      throw error;
    }
  }
}
