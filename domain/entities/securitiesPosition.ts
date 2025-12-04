export class SecuritiesPosition {
  constructor(
    readonly id: string,
    readonly customerId: string,
    readonly shareId: string,
    readonly totalQuantity: number,
    readonly blockedQuantity: number = 0
  ) {}

  getAvailableQuantity(): number {
    return this.totalQuantity - this.blockedQuantity;
  }

  hasEnoughShares(quantity: number): boolean {
    return this.getAvailableQuantity() >= quantity;
  }

  canSell(quantity: number): boolean {
    return this.hasEnoughShares(quantity) && quantity > 0;
  }

  isEmpty(): boolean {
    return this.totalQuantity === 0;
  }

  isFullyBlocked(): boolean {
    return (
      this.totalQuantity > 0 && this.blockedQuantity === this.totalQuantity
    );
  }

  getBlockedPercentage(): number {
    if (this.totalQuantity === 0) return 0;
    return (this.blockedQuantity / this.totalQuantity) * 100;
  }
}
