import { Router } from "express";
import { UserHttpHandler } from "@express/src/http/UserHttpHandler";
import { AccountHttpHandler } from "@express/src/http/AccountHttpHandler";
import { ShareHttpHandler } from "@express/src/http/ShareHttpHandler";
import { ConversationHttpHandler } from "@express/src/http/ConversationHttpHandler";
import { UserRepository } from "@application/repositories/users";
import { SessionRepository } from "@application/repositories/session";
import { Role } from "@domain/values/role";
import { createUserRoutes } from "./userRoutes";
import { createAccountRoutes } from "./accountRoutes";
import { createShareRoutes } from "./shareRoutes";
import { createTransactionRoutes } from "./transactionRoutes";
import { TransactionHttpHandler } from "@express/src/http/TransactionHttpHandler";
import { createTransferRoutes } from "./createTransferRoutes";
import { TransferHttpHandler } from "../http/TransferHttpHandler";
import { createConversationRoutes } from "./conversationRoutes";
import { CreditHttpHandler } from "../http/CreditHttpHandler";
import { createCreditRoutes } from "./creditRoutes";
import { createRoleMiddleware } from "@express/src/middleware/roleMiddleware";
import {
  userRepository,
  sessionRepository,
} from "@express/src/config/repositories";

export function createHttpRouter(
  userHttpHandler: UserHttpHandler,
  accountHttpHandler: AccountHttpHandler,
  shareHttpHandler: ShareHttpHandler,
  transactionHttpHandler: TransactionHttpHandler,
  TransferHttpHandler: TransferHttpHandler,
  conversationHttpHandler: ConversationHttpHandler,
  creditHttpHandler: CreditHttpHandler
): Router {
  const router = Router();

  // Middleware de protection pour le rôle MANAGER (directeur)
  const directorMiddleware = createRoleMiddleware(
    userRepository,
    sessionRepository,
    Role.MANAGER
  );

  router.use(createUserRoutes(userHttpHandler));
  router.use(createAccountRoutes(accountHttpHandler));
  router.use(createShareRoutes(shareHttpHandler, directorMiddleware));
  router.use(createTransactionRoutes(transactionHttpHandler));
  router.use(createTransferRoutes(TransferHttpHandler));
  router.use(createConversationRoutes(conversationHttpHandler));
  router.use(createCreditRoutes(creditHttpHandler));

  return router;
}
