// src/presentation/routes/verificationRoutes.ts
import { Router } from "express";
import { VerificationController } from "../controllers/VerificationController";
import { authMiddleware } from "@infrastructure/middleware/authMiddleware";
import { adminMiddleware } from "@infrastructure/middleware/adminMiddleware";
import { IAuthService } from "@domain/interfaces/IAuthServices";

export function createAdminVerificationRoutes(
  verificationController: VerificationController,
  authService: IAuthService
): Router {
  const router = Router();
  const auth = authMiddleware(authService);

  // All routes require authentication and admin role
  router.use(auth);
  router.use(adminMiddleware);

  // ============================================
  // ADMIN ENDPOINTS
  // ============================================

  /**
   * GET /api/v1/admin/verifications/pending
   * Get all pending verifications
   */
  router.get("/pending", (req, res, next) =>
    verificationController.getPendingVerifications(req, res, next)
  );

  return router;
}
