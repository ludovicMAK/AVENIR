import { GetAccountsFromOwnerId } from "@application/usecases/accounts/getAccountsFromOwnerId";
import { CreateAccount } from "@application/usecases/accounts/createAccount";
import { GetAccountById } from "@application/usecases/accounts/getAccountById";
import { CloseOwnAccount } from "@application/usecases/accounts/closeOwnAccount";
import { UpdateNameAccount } from "@application/usecases/accounts/updateNameAccount";
import {  CreateAccountRequest } from "@application/requests/accounts";

export class AccountController {
  public constructor(
    private readonly getAccountsFromOwnerId: GetAccountsFromOwnerId,
    private readonly createAccount: CreateAccount,
    private readonly getAccountById: GetAccountById,
    private readonly closeOwnAccount: CloseOwnAccount,
    private readonly updateNameAccount: UpdateNameAccount
  ) {}

  public async listByOwnerId(idOwner: string): Promise<Array<any>> {
    return await this.getAccountsFromOwnerId.execute({ id: idOwner });
  }

  public async getById(id: string): Promise<any> {
    return await this.getAccountById.execute({ id });
  }

  public async create(accountData: CreateAccountRequest): Promise<any> {
    return await this.createAccount.execute(accountData);
  }

  public async close(id: string, userId: string, token: string): Promise<void> {
    await this.closeOwnAccount.execute({ idAccount: id, userId, token });
  }
  public async updateName(idAccount: string, newAccountName: string, idOwner: string, token: string): Promise<boolean> {
    return await this.updateNameAccount.execute({ idAccount, newAccountName, idOwner, token });
  }
}
