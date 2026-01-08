import { InvalidShareDataError } from "@domain/errors";

export class Share {
  readonly id: string;
  readonly name: string;
  readonly totalNumberOfParts: number;
  readonly initialPrice: number;
  readonly lastExecutedPrice: number | null;
  readonly isActive: boolean;

  constructor(
    id: string,
    name: string,
    totalNumberOfParts: number,
    initialPrice: number,
    lastExecutedPrice: number | null = null,
    isActive: boolean = true
  ) {
    const normalizedName = Share.normalizeName(name);
    Share.assertValidName(normalizedName);
    Share.assertPositiveParts(totalNumberOfParts);
    Share.assertPositiveInitialPrice(initialPrice);

    this.id = id;
    this.name = normalizedName;
    this.totalNumberOfParts = totalNumberOfParts;
    this.initialPrice = initialPrice;
    this.lastExecutedPrice = lastExecutedPrice;
    this.isActive = isActive;
  }

  getCurrentPrice(): number {
    return this.lastExecutedPrice ?? this.initialPrice;
  }

  isAvailable(): boolean {
    return this.isActive && this.totalNumberOfParts > 0;
  }

  hasBeenTraded(): boolean {
    return this.lastExecutedPrice !== null;
  }

  withActivation(active: boolean): Share {
    return new Share(
      this.id,
      this.name,
      this.totalNumberOfParts,
      this.initialPrice,
      this.lastExecutedPrice,
      active
    );
  }

  withUpdatedDetails(params: {
    name: string;
    totalNumberOfParts: number;
    initialPrice: number;
  }): Share {
    const normalizedName = Share.normalizeName(params.name);
    Share.assertValidName(normalizedName);
    Share.assertPositiveParts(params.totalNumberOfParts);
    Share.assertPositiveInitialPrice(params.initialPrice);

    if (this.hasBeenTraded() && params.initialPrice !== this.initialPrice) {
      throw new InvalidShareDataError(
        "Cannot update initial price after trades have been executed",
        {
          issue: "initial_price_locked",
          context: { shareId: this.id },
        }
      );
    }

    return new Share(
      this.id,
      normalizedName,
      params.totalNumberOfParts,
      params.initialPrice,
      this.lastExecutedPrice,
      this.isActive
    );
  }

  private static normalizeName(name: string): string {
    return name.trim();
  }

  private static assertValidName(name: string): void {
    if (name.length === 0) {
      throw new InvalidShareDataError("Share name is required", {
        issue: "invalid_name",
      });
    }
  }

  private static assertPositiveParts(totalNumberOfParts: number): void {
    if (totalNumberOfParts <= 0) {
      throw new InvalidShareDataError(
        "Total number of parts must be positive",
        {
          issue: "invalid_total_number_of_parts",
          context: { totalNumberOfParts },
        }
      );
    }
  }

  private static assertPositiveInitialPrice(initialPrice: number): void {
    if (initialPrice <= 0) {
      throw new InvalidShareDataError("Initial price must be positive", {
        issue: "invalid_initial_price",
        context: { initialPrice },
      });
    }
  }
}
