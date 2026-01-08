import { Share } from "@domain/entities/share";

export interface ShareRepository {
  save(share: Share): Promise<void>;
  findById(id: string): Promise<Share | null>;
  findAll(): Promise<Share[]>;
  findByName(name: string): Promise<Share | null>;
  updateLastExecutedPrice(shareId: string, price: number): Promise<void>;
  update(share: Share): Promise<void>;
  delete(shareId: string): Promise<void>;
}
