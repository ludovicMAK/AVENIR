import { Request, Response } from "express"
import { ActivityController } from "@express/controllers/ActivityController"
import { ValidationError } from "@application/errors"
import { mapErrorToHttpResponse } from "@express/src/responses/error"
import { sendSuccess } from "@express/src/responses/success"
import { AuthGuard } from "@express/src/http/AuthGuard"
import { SSEManager } from "@express/src/services/SSE/SSEManager"
import { ActivityFeed } from "@domain/types/ActivityFeed"

export class ActivityHttpHandler {
  constructor(
    private readonly controller: ActivityController,
    private readonly authGuard: AuthGuard
  ) {}

  public async createActivity(request: Request, response: Response) {
    try {
      const authUser = await this.authGuard.requireAuthenticated(request)

      // Vérifier que l'user est conseiller ou directeur
      if (authUser.role.getValue() !== "bankAdvisor" && authUser.role.getValue() !== "bankManager") {
        throw new ValidationError("Only advisors and managers can create activities")
      }

      const { title, description, priority } = request.body

      if (!title || !description || !priority) {
        throw new ValidationError("Missing required fields")
      }

      const result = await this.controller.create({
        title,
        description,
        authorId: authUser.id,
        priority,
      })

      return sendSuccess(response, {
        status: 201,
        code: "ACTIVITY_CREATED",
        message: "Activity created and broadcasted successfully",
        data: result,
      })
    } catch (error) {
      return mapErrorToHttpResponse(response, error)
    }
  }

  public async getActivities(request: Request, response: Response) {
    try {
      await this.authGuard.requireAuthenticated(request)

      const activities = await this.controller.getAll({})

      return sendSuccess<ActivityFeed[]>(response, {
        status: 200,
        code: "ACTIVITIES_FETCHED",
        message: "Activities fetched successfully",
        data: activities,
      })
    } catch (error) {
      return mapErrorToHttpResponse(response, error)
    }
  }

  public async getRecentActivities(request: Request, response: Response) {
    try {
      await this.authGuard.requireAuthenticated(request)

      const hoursThreshold = request.query.hours ? parseInt(request.query.hours as string, 10) : 48

      const activities = await this.controller.getRecent({ hoursThreshold })

      return sendSuccess<ActivityFeed[]>(response, {
        status: 200,
        code: "RECENT_ACTIVITIES_FETCHED",
        message: "Recent activities fetched successfully",
        data: activities,
      })
    } catch (error) {
      return mapErrorToHttpResponse(response, error)
    }
  }

  public async updateActivity(request: Request, response: Response) {
    try {
      const authUser = await this.authGuard.requireAuthenticated(request)

      // Vérifier que l'user est conseiller ou directeur
      if (authUser.role.getValue() !== "bankAdvisor" && authUser.role.getValue() !== "bankManager") {
        throw new ValidationError("Only advisors and managers can update activities")
      }

      const { activityId } = request.params
      const { title, description, priority } = request.body

      if (!activityId || !title || !description || !priority) {
        throw new ValidationError("Missing required fields")
      }

      await this.controller.update({
        activityId,
        title,
        description,
        priority,
      })

      return sendSuccess(response, {
        status: 200,
        code: "ACTIVITY_UPDATED",
        message: "Activity updated successfully",
        data: null,
      })
    } catch (error) {
      return mapErrorToHttpResponse(response, error)
    }
  }

  public async deleteActivity(request: Request, response: Response) {
    try {
      const authUser = await this.authGuard.requireAuthenticated(request)

      // Vérifier que l'user est conseiller ou directeur
      if (authUser.role.getValue() !== "bankAdvisor" && authUser.role.getValue() !== "bankManager") {
        throw new ValidationError("Only advisors and managers can delete activities")
      }

      const { activityId } = request.params

      if (!activityId) {
        throw new ValidationError("Activity ID is required")
      }

      await this.controller.delete({ activityId })

      return sendSuccess(response, {
        status: 200,
        code: "ACTIVITY_DELETED",
        message: "Activity deleted successfully",
        data: null,
      })
    } catch (error) {
      return mapErrorToHttpResponse(response, error)
    }
  }

  public async subscribeToActivities(request: Request, response: Response) {
    try {
      const authUser = await this.authGuard.requireAuthenticated(request)

      const sseService = SSEManager.getInstance()
      sseService.addClient(authUser.id, response, "activities")
    } catch (error) {
      return mapErrorToHttpResponse(response, error)
    }
  }
}
