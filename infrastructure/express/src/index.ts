import "dotenv/config"
import { app } from "./server"
import { ensureSchema } from "@express/src/db/migrate"
import { repositoryDriver } from "@express/src/config/repositories"
import { InfrastructureError } from "@application/errors"

const port = process.env.BACKEND_PORT
if (!port) {
    throw new InfrastructureError("BACKEND_PORT required environment variable is missing")
}

async function bootstrap() {
    try {
        if (repositoryDriver === "postgres") {
            await ensureSchema()
        }
        app.listen(port, () => {
            process.stdout.write(`HTTP server listening on port ${port}\n`)
        })
    } catch {
        process.stderr.write("Failed to start server due to database initialization error.\n")
        process.exit(1)
    }
}

void bootstrap()