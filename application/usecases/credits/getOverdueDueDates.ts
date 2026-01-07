import { SessionRepository } from "@application/repositories/session";
import { UserRepository } from "@application/repositories/users";
import { DueDateRepository } from "@application/repositories/dueDate";
import { CreditRepository } from "@application/repositories/credit";
import { GetOverdueDueDatesRequest } from "@application/requests/credit";
import { OverdueDueDateWithCredit } from "@domain/types/OverdueDueDateWithCredit";
import { ConnectedError, UnauthorizedError } from "@application/errors";

export class GetOverdueDueDates {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly userRepository: UserRepository,
    private readonly dueDateRepository: DueDateRepository,
    private readonly creditRepository: CreditRepository
  ) {}

  async execute(request: GetOverdueDueDatesRequest): Promise<OverdueDueDateWithCredit[]> {
    const isConnected = await this.sessionRepository.isConnected(request.userId, request.token);
    if (!isConnected) throw new ConnectedError("User is not connected");

    const user = await this.userRepository.getInformationUserConnected(request.userId, request.token);
    if (!user || (user.role.getValue() !== "bankAdvisor" && user.role.getValue() !== "bankManager")) {
      throw new UnauthorizedError("Only bank staff can view overdue due dates");
    }

    const overdueDueDates = await this.dueDateRepository.findOverdue();

    const result: OverdueDueDateWithCredit[] = [];

    for (const dueDate of overdueDueDates) {
      const credit = await this.creditRepository.findById(dueDate.creditId);
      if (credit) {
        const customer = await this.userRepository.findById(credit.customerId);
        result.push({
          dueDate,
          credit,
          customerName: customer ? `${customer.firstname} ${customer.lastname}` : undefined,
        });
      }
    }

    return result;
  }
}
