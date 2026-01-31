import { Router } from "express"
import { ActivityHttpHandler } from "@express/src/http/ActivityHttpHandler"

export function createActivityRoutes(activityHttpHandler: ActivityHttpHandler): Router {
  const router = Router()

  // Create activity (advisor/manager only)
  router.post("/activities", (request, response) =>
    activityHttpHandler.createActivity(request, response)
  )

  // Get all activities
  router.get("/activities", (request, response) =>
    activityHttpHandler.getActivities(request, response)
  )

  // Get recent activities
  router.get("/activities/recent", (request, response) =>
    activityHttpHandler.getRecentActivities(request, response)
  )

  // Update activity (advisor/manager only)
  router.patch("/activities/:activityId", (request, response) =>
    activityHttpHandler.updateActivity(request, response)
  )

  // Delete activity (advisor/manager only)
  router.delete("/activities/:activityId", (request, response) =>
    activityHttpHandler.deleteActivity(request, response)
  )

  // Subscribe to activities via SSE
  router.get("/activities/subscribe", (request, response) =>
    activityHttpHandler.subscribeToActivities(request, response)
  )

  return router
}
