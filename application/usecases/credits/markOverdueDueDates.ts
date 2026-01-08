import { DueDateRepository } from "@application/repositories/dueDate";
import { SessionRepository } from "@application/repositories/session";
import { DueDate } from "@domain/entities/dueDate";
import { DueDateStatus } from "@domain/values/dueDateStatus";
import { UnitOfWorkFactory } from "@application/services/UnitOfWork";
import { MarkOverdueRequest } from "@application/requests/credit";
import { MarkOverdueResult } from "@domain/types/MarkOverdueResult";
import { ConnectedError, UnauthorizedError } from "@application/errors";
import { UserRepository } from "@application/repositories/users";

export class MarkOverdueDueDates {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly userRepository: UserRepository,
    private readonly dueDateRepository: DueDateRepository,
    private readonly unitOfWorkFactory: UnitOfWorkFactory
  ) {}

  async execute(request: MarkOverdueRequest): Promise<MarkOverdueResult> {
    const isConnected = await this.sessionRepository.isConnected(request.userId, request.token);
    if (!isConnected) throw new ConnectedError("User is not connected");

    const user = await this.userRepository.getInformationUserConnected(request.userId, request.token);
    if (!user || (user.role.getValue() !== "bankAdvisor" && user.role.getValue() !== "bankManager")) {
      throw new UnauthorizedError("Only bank staff can mark overdue due dates");
    }

    const now = new Date();
    
    const allPayableDueDates = await this.dueDateRepository.findByStatus(DueDateStatus.PAYABLE.getValue());
    
    const overdueDueDates = allPayableDueDates.filter((dd) => dd.dueDate < now);

    if (overdueDueDates.length === 0) {
      return {
        markedCount: 0,
        dueDateIds: [],
      };
    }

    const unitOfWork = this.unitOfWorkFactory();
    await unitOfWork.begin();
    try {
      const markedIds: string[] = [];

      for (const dueDate of overdueDueDates) {
        const overdueDueDate = new DueDate(
          dueDate.id,
          dueDate.dueDate,
          dueDate.totalAmount,
          dueDate.shareInterest,
          dueDate.shareInsurance,
          dueDate.repaymentPortion,
          DueDateStatus.OVERDUE,
          dueDate.creditId,
          dueDate.paymentDate,
          dueDate.transferId
        );

        await this.dueDateRepository.update(overdueDueDate, unitOfWork);
        markedIds.push(dueDate.id);
      }

      await unitOfWork.commit();

      return {
        markedCount: markedIds.length,
        dueDateIds: markedIds,
      };
    } catch (error) {
      await unitOfWork.rollback();
      throw error;
    }
  }
}
