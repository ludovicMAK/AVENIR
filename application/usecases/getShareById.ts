import { ShareRepository } from "@application/repositories/share";
import { Share } from "@domain/entities/share";
import { GetShareInput } from "@application/requests/shares";
import { NotFoundError } from "@application/errors";

export class GetShareById {
  constructor(private readonly shareRepository: ShareRepository) {}

  async execute(input: GetShareInput): Promise<Share> {
    const share = await this.shareRepository.findById(input.shareId);

    if (!share) {
      throw new NotFoundError("Share not found");
    }

    return share;
  }
}
