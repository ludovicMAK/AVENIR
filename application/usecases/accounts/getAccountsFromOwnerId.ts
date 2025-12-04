import { RegisterUserInput } from "@application/requests/auth"
import { AccountRepository } from "@application/repositories/account"
import { ownerIdInput } from "@application/requests/accounts"

export class GetAccountsFromOwnerId {
    constructor(
        private readonly accountRepository: AccountRepository,
    ) {}

    async execute(input: ownerIdInput): Promise<Array<any>> {
        const accounts = await this.accountRepository.findByOwnerId(input.id)
        return accounts;
    }
}