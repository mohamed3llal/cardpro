import { Router } from "express";
import { ReportController } from "@presentation/controllers/ReportController";
import { authMiddleware } from "@infrastructure/middleware/authMiddleware";
import { adminMiddleware } from "@infrastructure/middleware/adminMiddleware";
import { IAuthService } from "@domain/interfaces/IAuthServices";
import rateLimit from "express-rate-limit";

const reportRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: "Too many reports submitted, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

export const createReportRoutes = (
  reportController: ReportController,
  authService: IAuthService
): Router => {
  const router = Router();
  const auth = authMiddleware(authService);

  router.post("/", auth, reportRateLimit, reportController.submitReport);
  router.get("/user", auth, reportController.getUserReports);
  router.get("/:reportId", auth, reportController.getReportById);
  router.delete("/:reportId", auth, reportController.deleteReport);

  // Admin routes
  router.get("/", auth, adminMiddleware, reportController.getAllReports);
  router.patch(
    "/:reportId/status",
    auth,
    adminMiddleware,
    reportController.updateReportStatus
  );

  return router;
};
