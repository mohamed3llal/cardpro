import { Router } from "express";
import { AnalyticsController } from "../controllers/AnalyticsController";
import { authMiddleware } from "@infrastructure/middleware/authMiddleware";
import { IAuthService } from "@domain/interfaces/IAuthServices";

export const createAnalyticsRoutes = (
  analyticsController: AnalyticsController,
  authService: IAuthService
): Router => {
  const router = Router();
  const auth = authMiddleware(authService);

  router.get("/stats", auth, analyticsController.getDashboardStats);
  router.get(
    "/cards/:cardId/analytics",
    auth,
    analyticsController.getCardAnalytics
  );
  router.get("/activity", auth, analyticsController.getRecentActivity);

  return router;
};
