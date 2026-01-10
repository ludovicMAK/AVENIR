import { DueDate } from "@domain/entities/dueDate";
import { DueDateStatus } from "@domain/values/dueDateStatus";
import { CreditStatus } from "@domain/values/creditStatus";
import { Credit } from "@domain/entities/credit";
import { SessionRepository } from "@application/repositories/session";
import { DueDateRepository } from "@application/repositories/dueDate";
import { AccountRepository } from "@application/repositories/account";
import { TransactionRepository } from "@application/repositories/transaction";
import { TransferRepository } from "@application/repositories/transfer";
import { CreditRepository } from "@application/repositories/credit";
import { UnitOfWorkFactory } from "@application/services/UnitOfWork";
import { UuidGenerator } from "@application/services/UuidGenerator";
import { BankConfiguration } from "@application/services/BankConfiguration";
import { PayInstallmentRequest } from "@application/requests/credit";
import { ConnectedError, NotFoundError, ValidationError } from "@application/errors";
import { Transfer } from "@domain/entities/transfer";
import { Transaction } from "@domain/entities/transaction";
import { TransactionDirection } from "@domain/values/transactionDirection";
import { StatusTransaction } from "@domain/values/statusTransaction";
import { StatusTransfer } from "@domain/values/statusTransfer";

export class PayInstallment {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly dueDateRepository: DueDateRepository,
    private readonly accountRepository: AccountRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly transferRepository: TransferRepository,
    private readonly creditRepository: CreditRepository,
    private readonly unitOfWorkFactory: UnitOfWorkFactory,
    private readonly uuidGenerator: UuidGenerator,
    private readonly bankConfiguration: BankConfiguration
  ) {}

  async execute(request: PayInstallmentRequest): Promise<DueDate> {
    const isConnected = await this.sessionRepository.isConnected(request.customerId, request.token);
    if (!isConnected) throw new ConnectedError("Customer is not connected");

    const dueDate = await this.dueDateRepository.findById(request.dueDateId);
    if (!dueDate) throw new NotFoundError("Due date not found");

    if (!dueDate.canBePaid()) {
      throw new ValidationError(`Due date cannot be paid. Current status: ${dueDate.status.getValue()}`);
    }

    const credit = await this.creditRepository.findById(dueDate.creditId);
    if (!credit) throw new NotFoundError("Associated credit not found");

    if (credit.customerId !== request.customerId) {
      throw new ValidationError("This due date does not belong to the customer");
    }
    const customerAccount = await this.accountRepository.findCurrentAccountByCustomerId(request.customerId);
    if (!customerAccount) throw new NotFoundError("Customer main account not found");

    const bankAccountIBAN = this.bankConfiguration.getBankAccountIBAN();
    const bankAccount = await this.accountRepository.findByIBAN(bankAccountIBAN);
    if (!bankAccount) throw new NotFoundError("Bank account not found");
    if (!bankAccount) throw new NotFoundError("Bank account not found");

    if (customerAccount.availableBalance < dueDate.totalAmount) {
      throw new ValidationError("Insufficient balance to pay this installment");
    }

    const unitOfWork = this.unitOfWorkFactory();
    await unitOfWork.begin();
    try {
      const transferId = this.uuidGenerator.generate();
      const transfer = new Transfer(
        transferId,
        dueDate.totalAmount,
        new Date(),
        new Date(),
        `Installment payment for credit ${credit.id}`,
        StatusTransfer.VALIDATED
      );

      await this.transferRepository.save(transfer, unitOfWork);

      const debitTransactionId = this.uuidGenerator.generate();
      const debitTransaction = new Transaction(
        debitTransactionId,
        customerAccount.IBAN,
        TransactionDirection.DEBIT,
        dueDate.totalAmount,
        `Installment payment for credit ${credit.id}`,
        new Date(),
        StatusTransaction.POSTED,
        transferId
      );

      await this.transactionRepository.createTransaction(debitTransaction, unitOfWork);

      const creditTransactionId = this.uuidGenerator.generate();
      const creditTransaction = new Transaction(
        creditTransactionId,
        bankAccount.IBAN,
        TransactionDirection.CREDIT,
        dueDate.totalAmount,
        `Installment payment for credit ${credit.id}`,
        new Date(),
        StatusTransaction.POSTED,
        transferId
      );

      await this.transactionRepository.createTransaction(creditTransaction, unitOfWork);

      const paidDueDate = new DueDate(
        dueDate.id,
        dueDate.dueDate,
        dueDate.totalAmount,
        dueDate.shareInterest,
        dueDate.shareInsurance,
        dueDate.repaymentPortion,
        DueDateStatus.PAID,
        dueDate.creditId,
        new Date(),
        transferId
      );

      await this.dueDateRepository.update(paidDueDate, unitOfWork);

      await this.accountRepository.updateBalance(customerAccount.id, -dueDate.totalAmount, unitOfWork);
      await this.accountRepository.updateBalanceAvailable(customerAccount.id, -dueDate.totalAmount, unitOfWork);
      await this.accountRepository.updateBalance(bankAccount.id, dueDate.totalAmount, unitOfWork);
      await this.accountRepository.updateBalanceAvailable(bankAccount.id, dueDate.totalAmount, unitOfWork);

      const allDueDates = await this.dueDateRepository.findByCreditId(credit.id);
      const allPaid = allDueDates.every((dd) => dd.id === paidDueDate.id ? true : dd.isPaid());

      if (allPaid) {
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
        await this.creditRepository.update(completedCredit, unitOfWork);
      }

      await unitOfWork.commit();
      return paidDueDate;
    } catch (error) {
      await unitOfWork.rollback();
      throw error;
    }
  }
}
