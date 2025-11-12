import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { httpRouter } from "@/infrastructure/express/src/routes";

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use("/api", httpRouter);

export { app };