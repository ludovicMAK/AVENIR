import { ActivityPriority } from "@domain/values/activityPriority"

export class Activity {
  constructor(
    readonly id: string,
    readonly title: string,
    readonly description: string,
    readonly authorId: string,
    readonly priority: ActivityPriority,
    readonly createdAt: Date,
    readonly updatedAt: Date | null = null
  ) {}

  isRecent(hoursThreshold: number = 48): boolean {
    const now = new Date()
    const diffMs = now.getTime() - this.createdAt.getTime()
    const diffHours = diffMs / (1000 * 60 * 60)
    return diffHours < hoursThreshold
  }

  isHighPriority(): boolean {
    return this.priority.equals(ActivityPriority.HIGH)
  }

  isMediumPriority(): boolean {
    return this.priority.equals(ActivityPriority.MEDIUM)
  }

  isLowPriority(): boolean {
    return this.priority.equals(ActivityPriority.LOW)
  }

  updateContent(title: string, description: string): Activity {
    return new Activity(
      this.id,
      title,
      description,
      this.authorId,
      this.priority,
      this.createdAt,
      new Date()
    )
  }
}
