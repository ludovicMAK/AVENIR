export class Share {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly totalNumberOfParts: number,
    readonly initialPrice: number,
    readonly lastExecutedPrice: number | null = null
  ) {}

  getCurrentPrice(): number {
    return this.lastExecutedPrice ?? this.initialPrice;
  }

  isAvailable(): boolean {
    return this.totalNumberOfParts > 0;
  }

  hasBeenTraded(): boolean {
    return this.lastExecutedPrice !== null;
  }
}
