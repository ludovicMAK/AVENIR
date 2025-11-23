export class EmailConfirmationToken {
    constructor(
        readonly userId: string,
        readonly token: string,
        readonly expiresAt: Date
    ) {}

    isExpired(): boolean {
        return new Date() > this.expiresAt
    }
}