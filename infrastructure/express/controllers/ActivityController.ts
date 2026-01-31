import { CreateActivity } from "@application/usecases/activities/CreateActivity"
import { GetActivities } from "@application/usecases/activities/GetActivities"
import { GetActivityById } from "@application/usecases/activities/GetActivityById"
import { UpdateActivity } from "@application/usecases/activities/UpdateActivity"
import { DeleteActivity } from "@application/usecases/activities/DeleteActivity"
import { GetRecentActivities } from "@application/usecases/activities/GetRecentActivities"
import {
  CreateActivityInput,
  GetActivitiesInput,
  GetActivityByIdInput,
  UpdateActivityInput,
  DeleteActivityInput,
  GetRecentActivitiesInput,
} from "@application/requests/activities"
import { ActivityFeed } from "@domain/types/ActivityFeed"

export class ActivityController {
  public constructor(
    private readonly createActivity: CreateActivity,
    private readonly getActivities: GetActivities,
    private readonly getActivityById: GetActivityById,
    private readonly updateActivity: UpdateActivity,
    private readonly deleteActivity: DeleteActivity,
    private readonly getRecentActivities: GetRecentActivities
  ) {}

  public async create(payload: CreateActivityInput): Promise<{ activityId: string }> {
    return await this.createActivity.execute(payload)
  }

  public async getAll(payload: GetActivitiesInput): Promise<ActivityFeed[]> {
    return await this.getActivities.execute(payload)
  }

  public async getById(payload: GetActivityByIdInput): Promise<ActivityFeed> {
    return await this.getActivityById.execute(payload)
  }

  public async update(payload: UpdateActivityInput): Promise<void> {
    return await this.updateActivity.execute(payload)
  }

  public async delete(payload: DeleteActivityInput): Promise<void> {
    return await this.deleteActivity.execute(payload)
  }

  public async getRecent(payload: GetRecentActivitiesInput): Promise<ActivityFeed[]> {
    return await this.getRecentActivities.execute(payload)
  }
}
