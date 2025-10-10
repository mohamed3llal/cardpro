// src/presentation/routes/adminRoutes.ts
import { Router } from "express";
import { AdminController } from "../controllers/AdminController";
import { authMiddleware } from "@infrastructure/middleware/authMiddleware";
import { adminMiddleware } from "@infrastructure/middleware/adminMiddleware";
import { IAuthService } from "@domain/interfaces/IAuthServices";
import { DomainController } from "@presentation/controllers/DomainController";

export const createAdminRoutes = (
  adminController: AdminController,
  domainController: DomainController,
  authService: IAuthService
): Router => {
  const router = Router();
  const auth = authMiddleware(authService);

  // All admin routes require authentication and admin privileges
  router.use(auth);
  router.use(adminMiddleware);

  // ============================================
  // Admin Role Verification
  // ============================================
  router.get("/check-role", adminController.checkAdminRole);

  // ============================================
  // Dashboard & Analytics
  // ============================================
  router.get("/stats", adminController.getDashboardStats);
  router.get("/analytics", adminController.getAnalytics);

  // ============================================
  // User Management
  // ============================================
  router.get("/users", adminController.getAllUsers);
  router.post("/users", adminController.createUser);
  router.put("/users/:userId/role", adminController.updateUserRole);
  router.put("/users/:userId/toggle-status", adminController.toggleUserStatus);

  // ============================================
  // Card Management
  // ============================================
  router.get("/cards", adminController.getAllCards);
  router.delete("/cards/:cardId", adminController.deleteCard);

  // ============================================
  // Domain Management
  // ============================================

  router.post("/domains/", (req, res, next) =>
    domainController.createDomain(req, res, next)
  );
  router.put("/domains/:domainKey", (req, res, next) =>
    domainController.updateDomain(req, res, next)
  );
  router.delete("/domains/:domainKey", (req, res, next) =>
    domainController.deleteDomain(req, res, next)
  );

  router.post("/domains/:domainKey/subcategories", (req, res, next) =>
    domainController.addSubcategory(req, res, next)
  );
  router.put(
    "/domains/:domainKey/subcategories/:subcategoryKey",
    (req, res, next) => domainController.updateSubcategory(req, res, next)
  );
  router.delete(
    "/domains/:domainKey/subcategories/:subcategoryKey",
    (req, res, next) => domainController.deleteSubcategory(req, res, next)
  );

  // ============================================
  // Reports Management
  // ============================================
  router.get("/reports", adminController.getAllReports);
  router.put("/reports/:reportId/status", adminController.updateReportStatus);

  // ============================================
  // Reviews Management
  // ============================================
  router.get("/reviews", adminController.getAllReviews);
  router.delete("/reviews/:reviewId", adminController.deleteReview);

  // ============================================
  // Feedback Management
  // ============================================
  router.get("/feedback", adminController.getAllFeedback);
  router.put(
    "/feedback/:feedbackId/status",
    adminController.updateFeedbackStatus
  );

  // ============================================
  // Subscription Management
  // ============================================
  router.get("/subscriptions", adminController.getAllSubscriptions);
  router.put("/subscriptions/:userId", adminController.updateSubscription);

  return router;
};
