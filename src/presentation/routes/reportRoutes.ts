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
  // All admin routes require authentication and admin privileges
  router.use(auth);
  router.use(adminMiddleware);

  //
  router.post("/", reportRateLimit, reportController.submitReport);
  router.get("/user", reportController.getUserReports);
  router.get("/:reportId", reportController.getReportById);
  router.delete("/:reportId", reportController.deleteReport);

  return router;
};
