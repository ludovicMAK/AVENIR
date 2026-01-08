import { Credit } from "@domain/entities/credit";
import { CreditStatus } from "@domain/values/creditStatus";
import { CreditRepository } from "@application/repositories/credit";
import { SessionRepository } from "@application/repositories/session";
import { UserRepository } from "@application/repositories/users"; 
import { AccountRepository } from "@application/repositories/account"; 
import { UnitOfWorkFactory } from "@application/services/UnitOfWork"; 
import { UuidGenerator } from "@application/services/UuidGenerator";
import { GrantCreditRequest } from "@application/requests/credit";
import { ConnectedError, UnauthorizedError, NotFoundError, ValidationError } from "@application/errors";
import { GenerateAmortizationService } from "@application/services/GenerateAmortizationService";
import { DueDate } from "@domain/entities/dueDate";
import { DueDateStatus } from "@domain/values/dueDateStatus";
import { DueDateRepository } from "@application/repositories/dueDate";

export class GrantCredit {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly userRepository: UserRepository,
    private readonly accountRepository: AccountRepository,
    private readonly creditRepository: CreditRepository,
    private readonly dueDateRepository: DueDateRepository,
    private readonly amortizationService: GenerateAmortizationService,
    private readonly unitOfWorkFactory: UnitOfWorkFactory,
    private readonly uuidGenerator: UuidGenerator
  ) {}

  async execute(request: GrantCreditRequest): Promise<Credit> {
    const isConnected = await this.sessionRepository.isConnected(request.advisorId, request.token);
    if (!isConnected) throw new ConnectedError("Advisor is not connected");

    const advisor = await this.userRepository.getInformationUserConnected(request.advisorId, request.token);
    if (!advisor || (advisor.role.getValue() !== "bankAdvisor" && advisor.role.getValue() !== "bankManager")) {
      throw new UnauthorizedError("Only advisors can grant credits");
    }

    const customerAccount = await this.accountRepository.findById(request.accountId);
    if (!customerAccount) throw new NotFoundError("Account not found");
    
    if (customerAccount.idOwner !== request.customerId) {
      throw new UnauthorizedError("Account does not belong to the specified customer");
    }
    
    if (!customerAccount.isOpen()) {
      throw new ValidationError("Account must be open to receive credit");
    }

    const creditId = this.uuidGenerator.generate();
    const credit = new Credit(
      creditId,
      request.amountBorrowed,
      request.annualRate,
      request.insuranceRate,
      request.durationInMonths,
      new Date(),
      CreditStatus.IN_PROGRESS,
      request.customerId
    );

    const unitOfWork = this.unitOfWorkFactory();
    await unitOfWork.begin();
    try {
      await this.creditRepository.save(credit, unitOfWork);

      const schedule = this.amortizationService.generate(
        request.amountBorrowed,
        request.annualRate,
        request.insuranceRate,
        request.durationInMonths,
        credit.startDate
      );

      for (const row of schedule) {
        const dueDateId = this.uuidGenerator.generate();
        const due = new DueDate(
          dueDateId,
          row.dueDate,
          row.totalAmount,
          row.shareInterest,
          row.shareInsurance,
          row.repaymentPortion,
          DueDateStatus.PAYABLE,
          creditId
        );

        await this.dueDateRepository.save(due, unitOfWork as any);
      }

      await this.accountRepository.updateBalance(customerAccount.id, request.amountBorrowed, unitOfWork);
      await this.accountRepository.updateBalanceAvailable(customerAccount.id, request.amountBorrowed, unitOfWork);

      await unitOfWork.commit();
      return credit;
    } catch (error) {
      await unitOfWork.rollback();
      throw error;
    }
  }
}
