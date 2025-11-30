import { GetAccountsFromOwnerId } from "@application/usecases/getAccountsFromOwnerId"

export class AccountController {
    public constructor(
        private readonly getAccountsFromOwnerId: GetAccountsFromOwnerId,
    ) {}
    public async listByOwnerId(idOwner: string): Promise<Array<any>> {
        return await this.getAccountsFromOwnerId.execute({ id: idOwner })
    }
    
}