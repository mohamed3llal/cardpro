import { Router } from "express";
import { CardController } from "../controllers/CardController";
import { AnalyticsController } from "../controllers/AnalyticsController";
import { IAuthService } from "@domain/interfaces/IAuthServices";
import { createCardRoutes } from "./cardRoutes";
import { createAnalyticsRoutes } from "./analyticsRoutes";
import { createAuthRoutes } from "./authRoutes";
import { createUserRoutes } from "./userRoutes";
import { AuthController } from "@presentation/controllers/AuthController";
import { UserController } from "@presentation/controllers/UserController";
import { DomainController } from "@presentation/controllers/DomainController";
import { createDomainRoutes } from "./domainRoutes";
import { createBusinessesRoutes } from "./businessesRoutes";

export const createRoutes = (
  cardController: CardController,
  analyticsController: AnalyticsController,
  authController: AuthController,
  userController: UserController,
  authService: IAuthService,
  domainController: DomainController
): Router => {
  const router = Router();

  router.use("/auth", createAuthRoutes(authController, authService));

  router.use("/user", createUserRoutes(userController, authService));

  router.use("/cards", createCardRoutes(cardController, authService));

  router.use(
    "/businesses",
    createBusinessesRoutes(cardController, authService)
  );

  router.use(
    "/dashboard",
    createAnalyticsRoutes(analyticsController, authService)
  );

  router.use("/domains", createDomainRoutes(domainController));

  return router;
};
