import { confirmTransfer } from "@application/requests/transfer";
import { ValidTransferByAdmin } from "@application/usecases/transfer/validTransferByAdmin";
import { CancelTransfer, CancelTransferRequest } from "@application/usecases/transfer/cancelTransfer";

export class TransferController {
  public constructor(
    private readonly validTransferByAdmin: ValidTransferByAdmin,
    private readonly cancelTransferUsecase: CancelTransfer
  ) {}
  
  public async validateTransferByAdmin(input: confirmTransfer): Promise<void> {
    return await this.validTransferByAdmin.execute(input);
  }

  public async cancelTransfer(input: CancelTransferRequest): Promise<void> {
    return await this.cancelTransferUsecase.execute(input);
  }
}
