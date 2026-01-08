export class SavingsRate {
  constructor(
    readonly id: string,
    readonly rate: number,
    readonly dateEffect: Date
  ) {}

  isEffectiveAt(date: Date): boolean {
    return this.dateEffect.getTime() <= date.getTime();
  }
}
