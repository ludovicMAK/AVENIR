import { DueDateRepository } from "@application/repositories/dueDate";
import { CreditRepository } from "@application/repositories/credit";
import { SessionRepository } from "@application/repositories/session";
import { GetPaymentHistoryRequest } from "@application/requests/credit";
import { PaymentHistoryItem } from "@domain/types/PaymentHistoryItem";
import { ConnectedError, NotFoundError, ValidationError } from "@application/errors";

export class GetPaymentHistory {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly creditRepository: CreditRepository,
    private readonly dueDateRepository: DueDateRepository
  ) {}

  async execute(request: GetPaymentHistoryRequest): Promise<PaymentHistoryItem[]> {
    const isConnected = await this.sessionRepository.isConnected(request.userId, request.token);
    if (!isConnected) {
      throw new ConnectedError("User is not connected");
    }

    const credit = await this.creditRepository.findById(request.creditId);
    if (!credit) {
      throw new NotFoundError("Credit not found");
    }

    if (credit.customerId !== request.userId) {
      throw new ValidationError("You do not have permission to view this payment history");
    }

    const dueDates = await this.dueDateRepository.findByCreditId(credit.id);

    const paidDueDates = dueDates
      .filter((dd) => dd.isPaid() && dd.paymentDate && dd.transferId)
      .sort((a, b) => {
        if (!a.paymentDate || !b.paymentDate) return 0;
        return a.paymentDate.getTime() - b.paymentDate.getTime();
      });

    return paidDueDates.map((dd) => ({
      id: dd.id,
      dueDate: dd.dueDate,
      paymentDate: dd.paymentDate!,
      totalAmount: dd.totalAmount,
      shareInterest: dd.shareInterest,
      shareInsurance: dd.shareInsurance,
      repaymentPortion: dd.repaymentPortion,
      transferId: dd.transferId!,
    }));
  }
}
