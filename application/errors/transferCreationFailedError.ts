export class TransferCreationFailedError extends Error {
    constructor(message: string = "Le transfert n'a pas pu être créé dans le système.") {
        super(message);
        this.name = 'TransferCreationFailedError';
    }
}