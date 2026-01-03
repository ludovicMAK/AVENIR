import { Router } from "express";
import { UserHttpHandler } from "@express/src/http/UserHttpHandler";
import { AccountHttpHandler } from "@express/src/http/AccountHttpHandler";
import { ShareHttpHandler } from "@express/src/http/ShareHttpHandler";
import { ConversationHttpHandler } from "@express/src/http/ConversationHttpHandler";
import { createUserRoutes } from "./userRoutes";
import { createAccountRoutes } from "./accountRoutes";
import { createShareRoutes } from "./shareRoutes";
import { createTransactionRoutes } from "./transactionRoutes";
import { TransactionHttpHandler } from "@express/src/http/TransactionHttpHandler";
import { createTransferRoutes } from "./createTransferRoutes";
import { TransferHttpHandler } from "../http/TransferHttpHandler";
import { createConversationRoutes } from "./conversationRoutes";

export function createHttpRouter(
  userHttpHandler: UserHttpHandler,
  accountHttpHandler: AccountHttpHandler,
  shareHttpHandler: ShareHttpHandler,
  transactionHttpHandler: TransactionHttpHandler,
  TransferHttpHandler: TransferHttpHandler,
  conversationHttpHandler: ConversationHttpHandler
): Router {
  const router = Router();

  router.use(createUserRoutes(userHttpHandler));
  router.use(createAccountRoutes(accountHttpHandler));
  router.use(createShareRoutes(shareHttpHandler));
  router.use(createTransactionRoutes(transactionHttpHandler));
  router.use(createTransferRoutes(TransferHttpHandler));
  router.use(createConversationRoutes(conversationHttpHandler));

  return router;
}
