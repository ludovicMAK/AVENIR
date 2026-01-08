import { SecuritiesPositionRepository } from "@application/repositories/securitiesPosition";
import { SecuritiesPosition } from "@domain/entities/securitiesPosition";

export class InMemorySecuritiesPositionRepository
  implements SecuritiesPositionRepository
{
  private positions: Map<string, SecuritiesPosition> = new Map();

  async save(position: SecuritiesPosition): Promise<void> {
    this.positions.set(position.id, position);
  }

  async findById(id: string): Promise<SecuritiesPosition | null> {
    return this.positions.get(id) ?? null;
  }

  async findByCustomerId(customerId: string): Promise<SecuritiesPosition[]> {
    return Array.from(this.positions.values()).filter(
      (position) => position.customerId === customerId
    );
  }
  
  async findByCustomerIdAndShareId(
    customerId: string,
    shareId: string
  ): Promise<SecuritiesPosition | null> {
    for (const position of this.positions.values()) {
      if (position.customerId === customerId && position.shareId === shareId) {
        return position;
      }
    }
    return null;
  }

  async findByShareId(shareId: string): Promise<SecuritiesPosition[]> {
    return Array.from(this.positions.values()).filter(
      (position) => position.shareId === shareId
    );
  }

  async updateQuantities(
    positionId: string,
    totalQuantity: number,
    blockedQuantity: number
  ): Promise<void> {
    const position = this.positions.get(positionId);
    if (position) {
      const updatedPosition = new SecuritiesPosition(
        position.id,
        position.customerId,
        position.shareId,
        totalQuantity,
        blockedQuantity
      );
      this.positions.set(positionId, updatedPosition);
    }
  }

  async delete(positionId: string): Promise<void> {
    this.positions.delete(positionId);
  }
}
