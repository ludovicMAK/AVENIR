import { ShareRepository } from "@application/repositories/share";
import { Share } from "@domain/entities/share";

export class InMemoryShareRepository implements ShareRepository {
  private shares: Map<string, Share> = new Map();

  async save(share: Share): Promise<void> {
    this.shares.set(share.id, share);
  }

  async findById(id: string): Promise<Share | null> {
    return this.shares.get(id) ?? null;
  }

  async findAll(): Promise<Share[]> {
    return Array.from(this.shares.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }

  async findByName(name: string): Promise<Share | null> {
    const normalizedName = name.toLowerCase();
    for (const share of this.shares.values()) {
      if (share.name.toLowerCase() === normalizedName) {
        return share;
      }
    }
    return null;
  }

  async updateLastExecutedPrice(shareId: string, price: number): Promise<void> {
    const share = this.shares.get(shareId);
    if (share) {
      const updatedShare = new Share(
        share.id,
        share.name,
        share.totalNumberOfParts,
        share.initialPrice,
        price,
        share.isActive
      );
      this.shares.set(shareId, updatedShare);
    }
  }

  async update(share: Share): Promise<void> {
    this.shares.set(share.id, share);
  }

  async delete(shareId: string): Promise<void> {
    this.shares.delete(shareId);
  }
}
