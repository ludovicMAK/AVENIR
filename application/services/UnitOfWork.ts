
export interface UnitOfWork {
  begin(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
}

export type UnitOfWorkFactory = () => UnitOfWork;
