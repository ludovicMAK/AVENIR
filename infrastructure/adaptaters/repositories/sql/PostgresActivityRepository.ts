import { Pool } from "pg"
import { ActivityRepository } from "@application/repositories/activity"
import { Activity } from "@domain/entities/activity"
import { ActivityPriority } from "@domain/values/activityPriority"
import { InfrastructureError } from "@application/errors"
import { ensureError, ErrorLike } from "@application/utils/errors"

interface ActivityRow {
  id: string
  title: string
  description: string
  author_id: string
  priority: string
  created_at: Date
  updated_at: Date | null
}

export class PostgresActivityRepository implements ActivityRepository {
  constructor(private readonly pool: Pool) {}

  async save(activity: Activity): Promise<void> {
    try {
      await this.pool.query(
        `
          INSERT INTO activities (id, title, description, author_id, priority, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `,
        [
          activity.id,
          activity.title,
          activity.description,
          activity.authorId,
          activity.priority.getValue(),
          activity.createdAt,
          activity.updatedAt,
        ]
      )
    } catch (error) {
      this.handleDatabaseError(error)
    }
  }

  async findById(id: string): Promise<Activity | null> {
    try {
      const result = await this.pool.query<ActivityRow>(
        `
          SELECT id, title, description, author_id, priority, created_at, updated_at
          FROM activities
          WHERE id = $1
          LIMIT 1
        `,
        [id]
      )

      if (result.rowCount === 0) {
        return null
      }

      return this.mapRowToActivity(result.rows[0])
    } catch (error) {
      this.handleDatabaseError(error)
    }
  }

  async findAll(): Promise<Activity[]> {
    try {
      const result = await this.pool.query<ActivityRow>(
        `
          SELECT id, title, description, author_id, priority, created_at, updated_at
          FROM activities
          ORDER BY created_at DESC
        `
      )

      return result.rows.map((row) => this.mapRowToActivity(row))
    } catch (error) {
      this.handleDatabaseError(error)
    }
  }

  async findByAuthorId(authorId: string): Promise<Activity[]> {
    try {
      const result = await this.pool.query<ActivityRow>(
        `
          SELECT id, title, description, author_id, priority, created_at, updated_at
          FROM activities
          WHERE author_id = $1
          ORDER BY created_at DESC
        `,
        [authorId]
      )

      return result.rows.map((row) => this.mapRowToActivity(row))
    } catch (error) {
      this.handleDatabaseError(error)
    }
  }

  async findByPriority(priority: ActivityPriority): Promise<Activity[]> {
    try {
      const result = await this.pool.query<ActivityRow>(
        `
          SELECT id, title, description, author_id, priority, created_at, updated_at
          FROM activities
          WHERE priority = $1
          ORDER BY created_at DESC
        `,
        [priority.getValue()]
      )

      return result.rows.map((row) => this.mapRowToActivity(row))
    } catch (error) {
      this.handleDatabaseError(error)
    }
  }

  async findRecent(hoursThreshold: number): Promise<Activity[]> {
    try {
      const result = await this.pool.query<ActivityRow>(
        `
          SELECT id, title, description, author_id, priority, created_at, updated_at
          FROM activities
          WHERE created_at > CURRENT_TIMESTAMP - INTERVAL '${hoursThreshold} hours'
          ORDER BY created_at DESC
        `
      )

      return result.rows.map((row) => this.mapRowToActivity(row))
    } catch (error) {
      this.handleDatabaseError(error)
    }
  }

  async update(activity: Activity): Promise<void> {
    try {
      await this.pool.query(
        `
          UPDATE activities
          SET title = $1, description = $2, priority = $3, updated_at = CURRENT_TIMESTAMP
          WHERE id = $4
        `,
        [activity.title, activity.description, activity.priority.getValue(), activity.id]
      )
    } catch (error) {
      this.handleDatabaseError(error)
    }
  }

  async delete(activityId: string): Promise<void> {
    try {
      await this.pool.query(
        `
          DELETE FROM activities
          WHERE id = $1
        `,
        [activityId]
      )
    } catch (error) {
      this.handleDatabaseError(error)
    }
  }

  async deleteOldActivities(daysOld: number): Promise<number> {
    try {
      const result = await this.pool.query(
        `
          DELETE FROM activities
          WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '${daysOld} days'
          RETURNING id
        `
      )

      return result.rowCount || 0
    } catch (error) {
      this.handleDatabaseError(error)
    }
  }

  async countAll(): Promise<number> {
    try {
      const result = await this.pool.query<{ count: string }>(
        `
          SELECT COUNT(*) as count
          FROM activities
        `
      )

      return parseInt(result.rows[0]?.count || "0", 10)
    } catch (error) {
      this.handleDatabaseError(error)
    }
  }

  private mapRowToActivity(row: ActivityRow): Activity {
    return new Activity(
      row.id,
      row.title,
      row.description,
      row.author_id,
      ActivityPriority.from(row.priority),
      row.created_at,
      row.updated_at
    )
  }

  private handleDatabaseError(error: ErrorLike): never {
    const err = ensureError(error)
    throw new InfrastructureError(
      `Activity repository error: ${err.message}`,
      {
        scope: "infrastructure",
        issues: [{ message: "database_error" }],
        metadata: { originalError: err.message },
      }
    )
  }
}
