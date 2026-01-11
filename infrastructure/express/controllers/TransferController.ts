import { confirmTransfer } from "@application/requests/transfer";
import { ValidTransferByAdmin } from "@application/usecases/transfer/validTransferByAdmin";
import {
  CancelTransfer,
  CancelTransferRequest,
} from "@application/usecases/transfer/cancelTransfer";
import { GetTransferHistory } from "@application/usecases/transfer/getTransferHistory";

export class TransferController {
  public constructor(
    private readonly validTransferByAdmin: ValidTransferByAdmin,
    private readonly cancelTransferUsecase: CancelTransfer,
    private readonly getTransferHistoryUsecase: GetTransferHistory
  ) {}

  public async validateTransferByAdmin(input: confirmTransfer): Promise<void> {
    return await this.validTransferByAdmin.execute(input);
  }

  public async cancelTransfer(input: CancelTransferRequest): Promise<void> {
    return await this.cancelTransferUsecase.execute(input);
  }

  public async getHistory(): Promise<any[]> {
    return await this.getTransferHistoryUsecase.execute();
  }
}
