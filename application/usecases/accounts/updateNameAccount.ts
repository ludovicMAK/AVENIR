import { AccountRepository } from "@application/repositories/account";
import {  UpdateNameAccountRequest } from "@application/requests/accounts";
import { SessionRepository } from "@application/repositories/session";
import { ConnectedError, NotFoundError } from "@application/errors";



export class UpdateNameAccount {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly accountRepository: AccountRepository,
  ) {}

  async execute(request: UpdateNameAccountRequest): Promise<boolean> {
    const isConnected = await this.sessionRepository.isConnected(request.idOwner, request.token);
    if (!isConnected) {
      throw new ConnectedError("User is not connected");
    }
    const account = await this.accountRepository.findByIdAndUserId(request.idAccount, request.idOwner);
    if (!account) {
        throw new NotFoundError("Account not found");
    }
    return this.accountRepository.updateNameAccount(request.idAccount, request.newAccountName);
    
  }
}
