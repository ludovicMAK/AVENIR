import { ActivityRepository } from "@application/repositories/activity"
import { ValidationError } from "@application/errors"
import { DeleteActivityInput } from "@application/requests/activities"

export class DeleteActivity {
  constructor(private readonly activityRepository: ActivityRepository) {}

  async execute(input: DeleteActivityInput): Promise<void> {
    if (!input.activityId || input.activityId.trim().length === 0) {
      throw new ValidationError("Activity ID is required")
    }

    // Vérifier que l'activité existe
    const activity = await this.activityRepository.findById(input.activityId)
    if (!activity) {
      throw new ValidationError("Activity not found")
    }

    // Supprimer
    await this.activityRepository.delete(input.activityId)
  }
}
