import { ActivityRepository } from "@application/repositories/activity"
import { UserRepository } from "@application/repositories/users"
import { Activity } from "@domain/entities/activity"
import { ActivityPriority } from "@domain/values/activityPriority"
import { ValidationError } from "@application/errors"
import { CreateActivityInput } from "@application/requests/activities"
import { UuidGenerator } from "../../services/UuidGenerator"

export class CreateActivity {
  constructor(
    private readonly activityRepository: ActivityRepository,
    private readonly userRepository: UserRepository,
    private readonly uuidGenerator: UuidGenerator
  ) {}

  async execute(input: CreateActivityInput): Promise<{ activityId: string }> {
    const author = await this.userRepository.findById(input.authorId)
    if (!author) {
      throw new ValidationError("Author user not found")
    }

    const authorRole = author.role.getValue()
    if (authorRole !== "bankAdvisor" && authorRole !== "bankManager") {
      throw new ValidationError(
        "Only bank advisors and managers can create activities"
      )
    }

    if (!input.title || input.title.trim().length === 0) {
      throw new ValidationError("Activity title is required")
    }

    if (!input.description || input.description.trim().length === 0) {
      throw new ValidationError("Activity description is required")
    }

    const activityId = this.uuidGenerator.generate()
    const priority = ActivityPriority.from(input.priority)
    const activity = new Activity(
      activityId,
      input.title.trim(),
      input.description.trim(),
      input.authorId,
      priority,
      new Date(),
      null
    )

    await this.activityRepository.save(activity)

    return { activityId }
  }
}
