import { GetAccountsFromOwnerId } from "@application/usecases/getAccountsFromOwnerId";
import { CreateAccount } from "@application/usecases/createAccount";
import { GetAccountById } from "@application/usecases/getAccountById";
import { CloseAccount } from "@application/usecases/closeAccount";

export class AccountController {
  public constructor(
    private readonly getAccountsFromOwnerId: GetAccountsFromOwnerId,
    private readonly createAccount: CreateAccount,
    private readonly getAccountById: GetAccountById,
    private readonly closeAccount: CloseAccount
  ) {}

  public async listByOwnerId(idOwner: string): Promise<Array<any>> {
    return await this.getAccountsFromOwnerId.execute({ id: idOwner });
  }

  public async getById(id: string): Promise<any> {
    return await this.getAccountById.execute({ id });
  }

  public async create(accountData: any): Promise<any> {
    return await this.createAccount.execute(accountData);
  }

  public async close(id: string): Promise<void> {
    await this.closeAccount.execute({ id });
  }
}
