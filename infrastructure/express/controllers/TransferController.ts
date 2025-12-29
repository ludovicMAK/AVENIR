import { confirmTransfer } from "@application/requests/transfer";
import { ValidTransferByAdmin } from "@application/usecases/transfer/validTransferByAdmin";

export class TransferController {
  public constructor(
    private readonly validTransferByAdmin: ValidTransferByAdmin,
   
  ) {}
    public async validateTransferByAdmin(input: confirmTransfer): Promise<void> {
        return await this.validTransferByAdmin.execute(input);
    }
  
}
