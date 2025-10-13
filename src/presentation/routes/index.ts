// src/presentation/routes/index.ts - Add admin routes
import { Router } from "express";
import { CardController } from "../controllers/CardController";
import { AnalyticsController } from "../controllers/AnalyticsController";
import { AdminController } from "../controllers/AdminController";
import { IAuthService } from "@domain/interfaces/IAuthServices";
import { createCardRoutes } from "./cardRoutes";
import { createAnalyticsRoutes } from "./analyticsRoutes";
import { createAuthRoutes } from "./authRoutes";
import { createUserRoutes } from "./userRoutes";
import { createAdminRoutes } from "./adminRoutes";
import { AuthController } from "@presentation/controllers/AuthController";
import { UserController } from "@presentation/controllers/UserController";
import { DomainController } from "@presentation/controllers/DomainController";
import { createDomainRoutes } from "./domainRoutes";
// import { createBusinessRoutes } from "./businessesRoutes";
// import { BusinessController } from "@presentation/controllers/BusinessController";
import { VerificationController } from "../controllers/VerificationController";
import { createAdminVerificationRoutes } from "./verificationRoutes";

export const createRoutes = (
  cardController: CardController,
  analyticsController: AnalyticsController,
  authController: AuthController,
  userController: UserController,
  authService: IAuthService,
  domainController: DomainController,
  adminController: AdminController,
  // businessController: BusinessController,
  verificationController: VerificationController
): Router => {
  const router = Router();

  // Auth routes
  router.use("/auth", createAuthRoutes(authController, authService));

  // User routes
  router.use(
    "/user",
    createUserRoutes(userController, verificationController, authService)
  );

  // Card routes
  router.use("/dashboard", createCardRoutes(cardController, authService));

  // Business routes
  // router.use(
  //   "/businesses",
  //   createBusinessRoutes(businessController, authService)
  // );

  // Dashboard routes
  router.use(
    "/dashboard",
    createAnalyticsRoutes(analyticsController, authService)
  );

  // Domain routes
  router.use("/domains", createDomainRoutes(domainController));

  // Admin routes
  router.use(
    "/admin",
    createAdminRoutes(
      adminController,
      domainController,
      verificationController,
      authService
    )
  );

  // Verification routes
  router.use(
    "/verifications",
    createAdminVerificationRoutes(verificationController, authService)
  );

  return router;
};
