import { Activity } from "@domain/entities/activity"

export type ActivityFeed = {
  id: string
  title: string
  description: string
  authorId: string
  authorEmail: string
  authorFirstname: string
  authorLastname: string
  authorRole: string
  priority: string
  createdAt: Date
  updatedAt: Date | null
}

export type ActivityWithAuthor = {
  activity: Activity
  authorEmail: string
  authorFirstname: string
  authorLastname: string
  authorRole: string
}
