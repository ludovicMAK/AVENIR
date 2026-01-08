import { SecuritiesPosition } from "@domain/entities/securitiesPosition";

export interface SecuritiesPositionRepository {
  save(position: SecuritiesPosition): Promise<void>;
  findById(id: string): Promise<SecuritiesPosition | null>;
  findByCustomerId(customerId: string): Promise<SecuritiesPosition[]>;
  findByShareId(shareId: string): Promise<SecuritiesPosition[]>;
  findByCustomerIdAndShareId(
    customerId: string,
    shareId: string
  ): Promise<SecuritiesPosition | null>;
  updateQuantities(
    positionId: string,
    totalQuantity: number,
    blockedQuantity: number
  ): Promise<void>;
  delete(positionId: string): Promise<void>;
}
