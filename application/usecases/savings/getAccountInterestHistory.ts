import { DailyInterestRepository } from "@application/repositories/dailyInterest";
import { AccountRepository } from "@application/repositories/account";
import {
  AccountNotFoundError,
  ForbiddenError,
  UnprocessableError,
  ValidationError,
} from "@application/errors";
import { GetAccountInterestHistoryRequest } from "@application/requests/savings";
import { AccountType } from "@domain/values/accountType";

export class GetAccountInterestHistory {
  constructor(
    private readonly dailyInterestRepository: DailyInterestRepository,
    private readonly accountRepository: AccountRepository
  ) {}

  async execute(request: GetAccountInterestHistoryRequest) {
    const account = await this.accountRepository.findById(request.accountId);
    if (!account) {
      throw new AccountNotFoundError();
    }
    if (account.idOwner !== request.userId) {
      throw new ForbiddenError("You are not the owner of this account.");
    }
    if (!account.accountType.equals(AccountType.SAVINGS)) {
      throw new UnprocessableError(
        "Interest history is only available for savings accounts."
      );
    }

    const fromDate = request.from ? new Date(request.from) : null;
    const toDate = request.to ? new Date(request.to) : null;

    if (fromDate && Number.isNaN(fromDate.getTime())) {
      throw new ValidationError("Invalid start date.");
    }
    if (toDate && Number.isNaN(toDate.getTime())) {
      throw new ValidationError("Invalid end date.");
    }

    if (fromDate && toDate) {
      const start = new Date(fromDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(toDate);
      end.setHours(23, 59, 59, 999);

      return this.dailyInterestRepository.findByDateRange(
        account.id,
        start,
        end
      );
    }

    return this.dailyInterestRepository.findByAccountId(account.id);
  }
}
