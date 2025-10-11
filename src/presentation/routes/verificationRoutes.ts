// src/presentation/routes/verificationRoutes.ts
import { Router } from "express";
import { VerificationController } from "../controllers/VerificationController";
import { authMiddleware } from "@infrastructure/middleware/authMiddleware";
import { adminMiddleware } from "@infrastructure/middleware/adminMiddleware";
import { IAuthService } from "@domain/interfaces/IAuthServices";

export function createVerificationRoutes(
  verificationController: VerificationController,
  authService: IAuthService
): Router {
  const router = Router();
  const auth = authMiddleware(authService);

  // ============================================
  // USER ENDPOINTS (Authenticated users)
  // ============================================

  /**
   * POST /api/v1/user/domain-verification
   * Submit domain verification request
   */
  router.post("/domain-verification", auth, (req, res, next) =>
    verificationController.submitDomainVerification(req, res, next)
  );

  return router;
}

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

  /**
   * GET /api/v1/admin/verifications
   * Get all verifications (with optional status filter)
   * Query params: ?status=pending|approved|rejected
   */
  router.get("/", (req, res, next) =>
    verificationController.getAllVerifications(req, res, next)
  );

  /**
   * POST /api/v1/admin/users/:userId/verify/approve
   * Approve user verification
   */
  router.post("/:userId/verify/approve", (req, res, next) =>
    verificationController.approveUserVerification(req, res, next)
  );

  /**
   * POST /api/v1/admin/users/:userId/verify/reject
   * Reject user verification
   */
  router.post("/:userId/verify/reject", (req, res, next) =>
    verificationController.rejectUserVerification(req, res, next)
  );

  return router;
}
