import { ActivityRepository } from "@application/repositories/activity"
import { UserRepository } from "@application/repositories/users"
import { ValidationError } from "@application/errors"
import { UpdateActivityInput } from "@application/requests/activities"
import { ActivityPriority } from "@domain/values/activityPriority"

export class UpdateActivity {
  constructor(
    private readonly activityRepository: ActivityRepository,
    private readonly userRepository: UserRepository
  ) {}

  async execute(input: UpdateActivityInput): Promise<void> {
    if (!input.activityId || input.activityId.trim().length === 0) {
      throw new ValidationError("Activity ID is required")
    }

    const activity = await this.activityRepository.findById(input.activityId)
    if (!activity) {
      throw new ValidationError("Activity not found")
    }

    if (!input.title || input.title.trim().length === 0) {
      throw new ValidationError("Activity title is required")
    }

    if (!input.description || input.description.trim().length === 0) {
      throw new ValidationError("Activity description is required")
    }

    const priority = ActivityPriority.from(input.priority)
    const updatedActivity = activity.updateContent(input.title.trim(), input.description.trim())

    await this.activityRepository.update(updatedActivity)
  }
}
