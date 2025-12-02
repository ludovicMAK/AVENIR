export class ShareTransaction {
  constructor(
    readonly id: string,
    readonly shareId: string,
    readonly buyOrderId: string,
    readonly sellOrderId: string,
    readonly buyerId: string,
    readonly sellerId: string,
    readonly priceExecuted: number,
    readonly quantity: number,
    readonly dateExecuted: Date,
    readonly buyerFee: number = 100,
    readonly sellerFee: number = 100
  ) {}

  getTotalAmount(): number {
    return this.priceExecuted * this.quantity;
  }

  getTotalAmountForBuyer(): number {
    return this.getTotalAmount() + this.buyerFee;
  }

  getTotalAmountForSeller(): number {
    return this.getTotalAmount() - this.sellerFee;
  }

  getTotalCost(): number {
    return this.getTotalAmount() + this.buyerFee + this.sellerFee;
  }

  getTotalFees(): number {
    return this.buyerFee + this.sellerFee;
  }
}
