import express from "express"
import bodyParser from "body-parser"
import cors from "cors"
import { InfrastructureError } from "@application/errors"
import { httpRouter } from "@express/src/config/dependencies"

const app = express()

const frontendUrl = process.env.FRONTEND_URL
if (!frontendUrl) {
    throw new InfrastructureError("FRONTEND_URL required environment variable is missing")
}

app.use(
    cors({
        origin: frontendUrl,
        credentials: true
    })
)
app.use(bodyParser.json())
app.use("/api", httpRouter)

export { app }