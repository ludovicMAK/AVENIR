import { Activity } from "@domain/entities/activity"
import { ActivityPriority } from "@domain/values/activityPriority"

export interface ActivityRepository {
  save(activity: Activity): Promise<void>
  findById(id: string): Promise<Activity | null>
  findAll(): Promise<Activity[]>
  findByAuthorId(authorId: string): Promise<Activity[]>
  findByPriority(priority: ActivityPriority): Promise<Activity[]>
  findRecent(hoursThreshold: number): Promise<Activity[]>
  update(activity: Activity): Promise<void>
  delete(activityId: string): Promise<void>
  deleteOldActivities(daysOld: number): Promise<number>
  countAll(): Promise<number>
}
