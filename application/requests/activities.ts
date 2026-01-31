export type CreateActivityInput = {
  title: string
  description: string
  authorId: string
  priority: "low" | "medium" | "high"
}

export type GetActivitiesInput = {
  limit?: number
  offset?: number
}

export type GetActivityByIdInput = {
  activityId: string
}

export type UpdateActivityInput = {
  activityId: string
  title: string
  description: string
  priority: "low" | "medium" | "high"
}

export type DeleteActivityInput = {
  activityId: string
}

export type GetActivitiesByAuthorInput = {
  authorId: string
}

export type GetRecentActivitiesInput = {
  hoursThreshold?: number
}
