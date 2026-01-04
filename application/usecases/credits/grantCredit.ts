import { Credit } from "@domain/entities/credit";
import { CreditStatus } from "@domain/values/creditStatus";
import { CreditRepository } from "@application/repositories/credit";
import { SessionRepository } from "@application/repositories/session";
import { UserRepository } from "@application/repositories/users"; 
import { AccountRepository } from "@application/repositories/account"; 
import { UnitOfWork } from "@application/services/UnitOfWork"; 
import { UuidGenerator } from "@application/services/UuidGenerator";
import { GrantCreditRequest } from "@application/requests/credit";
import { ConnectedError, UnauthorizedError, NotFoundError } from "@application/errors";

export class GrantCredit {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly userRepository: UserRepository,
    private readonly accountRepository: AccountRepository,
    private readonly creditRepository: CreditRepository,
    private readonly unitOfWork: UnitOfWork,
    private readonly uuidGenerator: UuidGenerator
  ) {}

  async execute(request: GrantCreditRequest): Promise<Credit> {
    const isConnected = await this.sessionRepository.isConnected(request.advisorId, request.token);
    if (!isConnected) throw new ConnectedError("Advisor is not connected");

    const advisor = await this.userRepository.getInformationUserConnected(request.advisorId, request.token);
    if (!advisor || (advisor.role.getValue() !== "bankAdvisor" && advisor.role.getValue() !== "bankManager")) {
      throw new UnauthorizedError("Only advisors can grant credits");
    }

    const customerAccount = await this.accountRepository.findCurrentAccountByCustomerId(request.customerId);
    if (!customerAccount) throw new NotFoundError("Customer main account not found");

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

    await this.unitOfWork.begin();
    try {
      await this.creditRepository.save(credit, this.unitOfWork);


      await this.accountRepository.updateBalance(customerAccount.id, request.amountBorrowed, this.unitOfWork);
      await this.accountRepository.updateBalanceAvailable(customerAccount.id, request.amountBorrowed, this.unitOfWork);

      await this.unitOfWork.commit();
      return credit;
    } catch (error) {
      await this.unitOfWork.rollback();
      throw error;
    }
  }
}