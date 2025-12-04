import { Router } from "express";
import { UserHttpHandler } from "@express/src/http/UserHttpHandler";
import { AccountHttpHandler } from "@express/src/http/AccountHttpHandler";
import { ShareHttpHandler } from "@express/src/http/ShareHttpHandler";
import { createUserRoutes } from "./userRoutes";
import { createAccountRoutes } from "./accountRoutes";
import { createShareRoutes } from "./shareRoutes";

export function createHttpRouter(
  userHttpHandler: UserHttpHandler,
  accountHttpHandler: AccountHttpHandler,
  shareHttpHandler: ShareHttpHandler
): Router {
  const router = Router();

  router.use(createUserRoutes(userHttpHandler));
  router.use(createAccountRoutes(accountHttpHandler));
  router.use(createShareRoutes(shareHttpHandler));

  return router;
}
