export class Session {
  constructor(
    readonly id: string,
    readonly userId: string,
    readonly refreshToken: string,
    readonly expirationAt: Date,
    readonly createdAt: Date | null = null
  ) {}

  
}
