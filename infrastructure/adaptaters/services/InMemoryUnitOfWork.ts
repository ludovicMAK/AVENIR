import { UnitOfWork } from "@application/services/UnitOfWork";


export class InMemoryUnitOfWork implements UnitOfWork {
  private changeBuffer: any[] = [];
  private isActive: boolean = false;

  async begin(): Promise<void> {
    this.changeBuffer = [];
    this.isActive = true;
  }

 
  registerChange(change: any): void {
    if (!this.isActive) {
      throw new Error("UnitOfWork is not active. Call begin() first.");
    }
    this.changeBuffer.push(change);
  }

  async commit(): Promise<void> {
    if (!this.isActive) {
      throw new Error("UnitOfWork is not active.");
    }

    try {
      for (const change of this.changeBuffer) {
        await change.execute();
      }

      this.changeBuffer = [];
      this.isActive = false;
    } catch (error) {
      await this.rollback();
      throw error;
    }
  }

  async rollback(): Promise<void> {
    this.changeBuffer = [];
    this.isActive = false;
  }
}
