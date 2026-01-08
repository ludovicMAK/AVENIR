import { SavingsRateRepository } from "@application/repositories/savingsRate";
import { DailyInterestRepository } from "@application/repositories/dailyInterest";
import { AccountRepository } from "@application/repositories/account";
import { TransactionRepository } from "@application/repositories/transaction";
import { UuidGenerator } from "@application/services/UuidGenerator";
import { UnitOfWorkFactory } from "@application/services/UnitOfWork";
import {
  ForbiddenError,
  UnprocessableError,
  ValidationError,
} from "@application/errors";
import { ProcessDailySavingsInterestRequest } from "@application/requests/savings";
import { CreditMode } from "@domain/values/creditMode";
import { DailyInterest } from "@domain/entities/dailyInterest";
import { Transaction } from "@domain/entities/transaction";
import { TransactionDirection } from "@domain/values/transactionDirection";
import { StatusTransaction } from "@domain/values/statusTransaction";
import { Role } from "@domain/values/role";
import { AccountType } from "@domain/values/accountType";

type ProcessDailySavingsInterestResult = {
  date: string;
  processedAccounts: number;
  skippedAccounts: number;
};

export class ProcessDailySavingsInterest {
  constructor(
    private readonly savingsRateRepository: SavingsRateRepository,
    private readonly dailyInterestRepository: DailyInterestRepository,
    private readonly accountRepository: AccountRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly uuidGenerator: UuidGenerator,
    private readonly unitOfWorkFactory: UnitOfWorkFactory
  ) {}

  async execute(
    request: ProcessDailySavingsInterestRequest
  ): Promise<ProcessDailySavingsInterestResult> {
    if (!request.actorRole.equals(Role.MANAGER)) {
      throw new ForbiddenError(
        "Only a bank director can trigger daily interests processing."
      );
    }

    const targetDate = request.date ? new Date(request.date) : new Date();
    if (request.date && Number.isNaN(targetDate.getTime())) {
      throw new ValidationError("Invalid processing date.");
    }

    const dayStart = new Date(targetDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(targetDate);
    dayEnd.setHours(23, 59, 59, 999);

    const activeRate = await this.savingsRateRepository.findActiveRate(
      dayStart
    );
    if (!activeRate) {
      throw new UnprocessableError(
        "No active savings rate found for this date."
      );
    }

    const savingsAccounts = await this.accountRepository.findByType(
      AccountType.SAVINGS
    );
    let processed = 0;
    let skipped = 0;

    for (const account of savingsAccounts) {
      if (!account.isOpen()) {
        skipped++;
        continue;
      }

      const alreadyComputed =
        (await this.dailyInterestRepository.findByDateRange(
          account.id,
          dayStart,
          dayEnd
        )).length > 0;

      if (alreadyComputed) {
        skipped++;
        continue;
      }

      const calculationBase = Math.max(account.balance, 0);
      const calculatedInterest = Math.floor(
        (calculationBase * activeRate.rate) / 36500
      );

      if (calculatedInterest <= 0) {
        skipped++;
        continue;
      }

      const interestId = this.uuidGenerator.generate();
      const transactionId = this.uuidGenerator.generate();
      const dailyInterest = new DailyInterest(
        interestId,
        dayStart,
        calculationBase,
        activeRate.rate,
        calculatedInterest,
        CreditMode.DAILY,
        account.id,
        transactionId
      );

      const unitOfWork = this.unitOfWorkFactory();
      await unitOfWork.begin();
      try {
        const reason = `Savings interests for ${dayStart
          .toISOString()
          .slice(0, 10)}`;

        await this.transactionRepository.createTransaction(
          new Transaction(
            transactionId,
            account.IBAN,
            TransactionDirection.CREDIT,
            calculatedInterest,
            reason,
            dayStart,
            StatusTransaction.VALIDATED,
            null
          ),
          unitOfWork
        );

        await this.accountRepository.updateBalance(
          account.id,
          calculatedInterest,
          unitOfWork
        );
        await this.accountRepository.updateBalanceAvailable(
          account.id,
          calculatedInterest,
          unitOfWork
        );

        await this.dailyInterestRepository.save(dailyInterest, unitOfWork);

        await unitOfWork.commit();
        processed++;
      } catch (error) {
        await unitOfWork.rollback();
        throw error;
      }
    }

    return {
      date: dayStart.toISOString().slice(0, 10),
      processedAccounts: processed,
      skippedAccounts: skipped,
    };
  }
}
