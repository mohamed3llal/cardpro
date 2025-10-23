// src/presentation/routes/index.ts
import { Router } from "express";
import { CardController } from "@presentation/controllers/CardController";
import { AnalyticsController } from "@presentation/controllers/AnalyticsController";
import { AdminController } from "@presentation/controllers/AdminController";
import { AuthController } from "@presentation/controllers/AuthController";
import { UserController } from "@presentation/controllers/UserController";
import { DomainController } from "@presentation/controllers/DomainController";
import { BusinessController } from "@presentation/controllers/BusinessController";
import { VerificationController } from "@presentation/controllers/VerificationController";
import { MessagingController } from "@presentation/controllers/MessagingController";
import { FavoriteController } from "@presentation/controllers/FavoriteController";
import { ReviewController } from "@presentation/controllers/ReviewController";
import { ReportController } from "@presentation/controllers/ReportController";
import { FeedbackController } from "@presentation/controllers/FeedbackController";
import { PackageController } from "@presentation/controllers/PackageController";
import { AdminPackageController } from "@presentation/controllers/AdminPackageController";

import { IAuthService } from "@domain/interfaces/IAuthServices";

import { createCardRoutes } from "./cardRoutes";
import { createAnalyticsRoutes } from "./analyticsRoutes";
import { createAuthRoutes } from "./authRoutes";
import { createUserRoutes } from "./userRoutes";
import { createAdminRoutes } from "./adminRoutes";
import { createDomainRoutes } from "./domainRoutes";
import { createBusinessRoutes } from "./businessRoutes";
import { createAdminVerificationRoutes } from "./verificationRoutes";
import { createMessagingRoutes } from "./messagingRoutes";
import { createFavoriteRoutes } from "./favoriteRoutes";
import { createReviewRoutes } from "./reviewRoutes";
import { createReportRoutes } from "./reportRoutes";
import { createFeedbackRoutes } from "./feedbackRoutes";
import { createPackageRoutes, createAdminPackageRoutes } from "./packageRoutes";

export const createRoutes = (
  cardController: CardController,
  analyticsController: AnalyticsController,
  authController: AuthController,
  userController: UserController,
  authService: IAuthService,
  domainController: DomainController,
  adminController: AdminController,
  businessController: BusinessController,
  verificationController: VerificationController,
  messagingController: MessagingController,
  favoriteController: FavoriteController,
  reviewController: ReviewController,
  reportController: ReportController,
  feedbackController: FeedbackController,
  packageController: PackageController,
  adminPackageController: AdminPackageController
): Router => {
  const router = Router();

  // ============================================
  // PUBLIC ROUTES
  // ============================================

  // Auth routes
  router.use("/auth", createAuthRoutes(authController, authService));

  // Domain routes (Public)
  router.use("/domains", createDomainRoutes(domainController));

  // Business routes (Public API)
  router.use("/businesses", createBusinessRoutes(businessController));

  // Package routes (Public + Protected)
  router.use("/", createPackageRoutes(packageController, authService));

  // ============================================
  // PROTECTED USER ROUTES
  // ============================================

  // User routes
  router.use(
    "/user",
    createUserRoutes(userController, verificationController, authService)
  );

  // Dashboard routes
  router.use("/dashboard", createCardRoutes(cardController, authService));
  router.use(
    "/dashboard",
    createAnalyticsRoutes(analyticsController, authService)
  );

  // Messaging routes
  router.use("/", createMessagingRoutes(messagingController, authService));

  // Favorites routes
  router.use(
    "/favorites",
    createFavoriteRoutes(favoriteController, authService)
  );

  // Review routes
  router.use("/", createReviewRoutes(reviewController, authService));

  // Report routes
  router.use("/reports", createReportRoutes(reportController, authService));

  // Feedback routes
  router.use(
    "/feedback",
    createFeedbackRoutes(feedbackController, authService)
  );

  // ============================================
  // ADMIN ROUTES
  // ============================================

  // Admin routes
  router.use(
    "/admin",
    createAdminRoutes(
      adminController,
      domainController,
      verificationController,
      reportController,
      feedbackController,
      reviewController,
      authService
    )
  );

  // Admin verification routes
  router.use(
    "/verifications",
    createAdminVerificationRoutes(verificationController, authService)
  );

  // Admin package routes
  router.use(
    "/admin",
    createAdminPackageRoutes(adminPackageController, authService)
  );

  return router;
};
