import { CreditRepository } from "@application/repositories/credit";
import { DueDateRepository } from "@application/repositories/dueDate";
import { SessionRepository } from "@application/repositories/session";
import { GetCreditStatusRequest } from "@application/requests/credit";
import { CreditStatusData } from "@domain/types/CreditStatusData";
import { ConnectedError, NotFoundError, ValidationError } from "@application/errors";

export class GetCreditStatus {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly creditRepository: CreditRepository,
    private readonly dueDateRepository: DueDateRepository
  ) {}

  async execute(request: GetCreditStatusRequest): Promise<CreditStatusData> {
    const isConnected = await this.sessionRepository.isConnected(request.userId, request.token);
    if (!isConnected) {
      throw new ConnectedError("User is not connected");
    }

    const credit = await this.creditRepository.findById(request.creditId);
    if (!credit) {
      throw new NotFoundError("Credit not found");
    }


    if (credit.customerId !== request.userId ) {
      throw new ValidationError("You do not have permission to view this credit");
    }

    const dueDates = await this.dueDateRepository.findByCreditId(credit.id);

    const totalDueDates = dueDates.length;
    const paidDueDates = dueDates.filter((dd) => dd.isPaid()).length;
    const remainingDueDates = totalDueDates - paidDueDates;

    const totalAmountPaid = dueDates
      .filter((dd) => dd.isPaid())
      .reduce((sum, dd) => sum + Number(dd.totalAmount), 0);

    const totalAmountToPay = dueDates.reduce((sum, dd) => sum + Number(dd.totalAmount), 0);
    const totalAmountRemaining = totalAmountToPay - totalAmountPaid;
    const percentageCompleted = totalAmountToPay > 0 
      ? Math.round((totalAmountPaid / totalAmountToPay) * 100) 
      : 0;

    const now = new Date();
    const payableDueDates = dueDates
      .filter((dd) => dd.isPayable() && dd.dueDate >= now)
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

    const nextDueDate = payableDueDates.length > 0
      ? {
          id: payableDueDates[0].id,
          dueDate: payableDueDates[0].dueDate,
          totalAmount: payableDueDates[0].totalAmount,
          status: payableDueDates[0].status.getValue(),
          daysUntilDue: payableDueDates[0].getDaysUntilDue(),
        }
      : undefined;

    const overdueDueDates = dueDates
      .filter((dd) => dd.isOverdue() || dd.isOverdueNow())
      .map((dd) => ({
        id: dd.id,
        dueDate: dd.dueDate,
        totalAmount: dd.totalAmount,
        daysOverdue: dd.getDaysOverdue(),
      }));

    return {
      credit: {
        id: credit.id,
        amountBorrowed: credit.amountBorrowed,
        annualRate: credit.annualRate,
        insuranceRate: credit.insuranceRate,
        durationInMonths: credit.durationInMonths,
        startDate: credit.startDate,
        status: credit.status.getValue(),
        customerId: credit.customerId,
      },
      progress: {
        totalDueDates,
        paidDueDates,
        remainingDueDates,
        totalAmountToPay,
        totalAmountPaid,
        totalAmountRemaining,
        percentageCompleted,
      },
      nextDueDate,
      overdueDueDates,
    };
  }
}
