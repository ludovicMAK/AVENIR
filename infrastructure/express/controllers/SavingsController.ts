import { UpdateSavingsRate } from "@application/usecases/savings/updateSavingsRate";
import { GetSavingsRateHistory } from "@application/usecases/savings/getSavingsRateHistory";
import { GetActiveSavingsRate } from "@application/usecases/savings/getActiveSavingsRate";
import { ProcessDailySavingsInterest } from "@application/usecases/savings/processDailySavingsInterest";
import { GetAccountInterestHistory } from "@application/usecases/savings/getAccountInterestHistory";
import {
  GetAccountInterestHistoryRequest,
  ProcessDailySavingsInterestRequest,
  UpdateSavingsRateRequest,
  GetActiveSavingsRateRequest,
} from "@application/requests/savings";

export class SavingsController {
  constructor(
    private readonly updateSavingsRate: UpdateSavingsRate,
    private readonly getSavingsRateHistory: GetSavingsRateHistory,
    private readonly getActiveSavingsRate: GetActiveSavingsRate,
    private readonly processDailySavingsInterest: ProcessDailySavingsInterest,
    private readonly accountInterestHistory: GetAccountInterestHistory
  ) {}

  async updateRate(request: UpdateSavingsRateRequest) {
    return this.updateSavingsRate.execute(request);
  }

  async history() {
    return this.getSavingsRateHistory.execute();
  }

  async activeRate(request: GetActiveSavingsRateRequest) {
    return this.getActiveSavingsRate.execute(request);
  }

  async processDailyInterest(request: ProcessDailySavingsInterestRequest) {
    return this.processDailySavingsInterest.execute(request);
  }

  async getAccountInterestHistory(
    request: GetAccountInterestHistoryRequest
  ) {
    return this.accountInterestHistory.execute(request);
  }
}
