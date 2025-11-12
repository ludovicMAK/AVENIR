import { app } from "./server";

const port = process.env.PORT ? Number(process.env.PORT) : 8000;

app.listen(port, () => {
    process.stdout.write(`HTTP server listening on port ${port}\n`);
});