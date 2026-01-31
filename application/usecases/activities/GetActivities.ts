import { ActivityRepository } from "@application/repositories/activity"
import { UserRepository } from "@application/repositories/users"
import { GetActivitiesInput } from "@application/requests/activities"
import { ActivityFeed } from "@domain/types/ActivityFeed"

export class GetActivities {
  constructor(
    private readonly activityRepository: ActivityRepository,
    private readonly userRepository: UserRepository
  ) {}

  async execute(input: GetActivitiesInput): Promise<ActivityFeed[]> {
    const activities = await this.activityRepository.findAll()

    const result: ActivityFeed[] = []

    for (const activity of activities) {
      const author = await this.userRepository.findById(activity.authorId)
      if (author) {
        result.push({
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
        })
      }
    }

    return result
  }
}
