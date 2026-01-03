import "dotenv/config";
import { createServer } from "http";
import { app } from "./server";
import { ensureSchema } from "@express/src/db/migrate";
import { repositoryDriver } from "@express/src/config/repositories";
import { InfrastructureError } from "@application/errors";
import { initializeWebSocket } from "./config/websocket";
import {
  conversationController,
  createConversation,
  createGroupConversation,
  sendMessage,
  transferConversation,
  closeConversation,
  addParticipant,
} from "./config/dependencies";

const port = process.env.BACKEND_PORT;
if (!port) {
  throw new InfrastructureError(
    "BACKEND_PORT required environment variable is missing"
  );
}

async function bootstrap() {
  try {
    if (repositoryDriver === "postgres") {
      await ensureSchema();
    }

    const httpServer = createServer(app);

    // Initialize WebSocket server and inject into use cases
    initializeWebSocket(httpServer, conversationController, {
      createConversation,
      createGroupConversation,
      sendMessage,
      transferConversation,
      closeConversation,
      addParticipant,
    });

    httpServer.listen(port, () => {
      process.stdout.write(`HTTP server listening on port ${port}\n`);
      process.stdout.write(`WebSocket server initialized\n`);
    });
  } catch {
    process.stderr.write(
      "Failed to start server due to database initialization error.\n"
    );
    process.exit(1);
  }
}

void bootstrap();
