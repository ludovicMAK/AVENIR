import { AccountRepository } from "@application/repositories/account"
import { ownerIdInput } from "@application/requests/accounts"
import { Account } from "@domain/entities/account"

export class GetAccountsFromOwnerId {
    constructor(
        private readonly accountRepository: AccountRepository,
    ) {}

    async execute(input: ownerIdInput): Promise<Account[]> {
        return this.accountRepository.findByOwnerId(input.id)
    }
}
