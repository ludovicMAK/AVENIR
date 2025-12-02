import { TransactionInput } from "@application/requests/transaction";
import { TransactionRepository } from "@application/repositories/transaction";
import { Transaction } from "@domain/entities/transaction";
import { UuidGenerator } from "@application/services/UuidGenerator";
import { TransferRepository } from "@application/repositories/transfer";
import { Transfer } from "@domain/entities/transfer";
import { Direction } from "@domain/values/direction";
import { StatusTransaction } from "@domain/values/statusTransaction";
import { TransferCreationFailedError } from "@application/errors/transferCreationFailedError";

export class CreateTransaction {
    constructor(
        private readonly transactionRepository: TransactionRepository,
        private readonly uuidGenerator: UuidGenerator,
        private readonly transferRepository: TransferRepository,
        
    ) {}

    async execute(input: TransactionInput): Promise<void> {
        const idFrom = this.uuidGenerator.generate();
        const idTo = this.uuidGenerator.generate();
        const id = this.uuidGenerator.generate();
        const transfer = new Transfer(id, input.amount, new Date(), input.dateExecuted, input.description);
        const transferInserted = await this.transferRepository.save(transfer);
        if(!transferInserted){
           throw new TransferCreationFailedError(
            "Échec de l'enregistrement du transfert pour le montant : " + input.amount
           );
        }













