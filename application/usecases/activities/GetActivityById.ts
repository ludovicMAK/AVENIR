import { ActivityRepository } from "@application/repositories/activity"
import { UserRepository } from "@application/repositories/users"
import { ValidationError } from "@application/errors"
import { GetActivityByIdInput } from "@application/requests/activities"
import { ActivityFeed } from "@domain/types/ActivityFeed"

export class GetActivityById {
  constructor(
    private readonly activityRepository: ActivityRepository,
    private readonly userRepository: UserRepository
  ) {}

  async execute(input: GetActivityByIdInput): Promise<ActivityFeed> {
    if (!input.activityId || input.activityId.trim().length === 0) {
      throw new ValidationError("Activity ID is required")
    }

    const activity = await this.activityRepository.findById(input.activityId)
    if (!activity) {
      throw new ValidationError("Activity not found")
    }

    const author = await this.userRepository.findById(activity.authorId)
    if (!author) {
      throw new ValidationError("Activity author not found")
    }

    return {
      id: activity.id,
      title: activity.title,
      description: activity.description,
      authorId: activity.authorId,
      authorEmail: author.email,
      authorFirstname: author.firstname,
      authorLastname: author.lastname,
      authorRole: author.role.getValue(),
      priority: activity.priority.getValue(),
      createdAt: activity.createdAt,
      updatedAt: activity.updatedAt,
    }
  }
}
