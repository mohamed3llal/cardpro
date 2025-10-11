// src/presentation/routes/businessRoutes.ts
import { Router } from "express";
import { BusinessController } from "@presentation/controllers/BusinessController";
import { authMiddleware } from "@infrastructure/middleware/authMiddleware";
import { IAuthService } from "@domain/interfaces/IAuthServices";
import { rateLimitMiddleware } from "@infrastructure/middleware/rateLimitMiddleware";

export function createBusinessRoutes(
  businessController: BusinessController,
  authService: IAuthService
): Router {
  const router = Router();
  const auth = authMiddleware(authService);

  // ============================================
  // PUBLIC ENDPOINTS
  // ============================================

  /**
   * GET /api/v1/businesses/search
   * Search and filter businesses
   * Rate limit: 100 requests per minute
   */
  router.get(
    "/search",
    rateLimitMiddleware({ windowMs: 60000, max: 100 }),
    (req, res, next) => businessController.searchBusinesses(req, res, next)
  );

  /**
   * GET /api/v1/businesses/featured
   * Get featured businesses for home page
   * Rate limit: 100 requests per minute
   */
  router.get(
    "/featured",
    rateLimitMiddleware({ windowMs: 60000, max: 100 }),
    (req, res, next) => businessController.getFeaturedBusinesses(req, res, next)
  );

  /**
   * GET /api/v1/businesses/:id
   * Get business by ID or slug
   * Rate limit: 200 requests per minute
   */
  router.get(
    "/:id",
    rateLimitMiddleware({ windowMs: 60000, max: 200 }),
    (req, res, next) => businessController.getBusinessById(req, res, next)
  );

  /**
   * GET /api/v1/businesses/:id/similar
   * Get similar businesses
   * Rate limit: 200 requests per minute
   */
  router.get(
    "/:id/similar",
    rateLimitMiddleware({ windowMs: 60000, max: 200 }),
    (req, res, next) => businessController.getSimilarBusinesses(req, res, next)
  );

  // ============================================
  // ANALYTICS ENDPOINTS
  // ============================================

  /**
   * POST /api/v1/businesses/:id/view
   * Record a view event
   * Rate limit: 1000 requests per minute
   */
  router.post(
    "/:id/view",
    rateLimitMiddleware({ windowMs: 60000, max: 1000 }),
    (req, res, next) => businessController.recordView(req, res, next)
  );

  /**
   * POST /api/v1/businesses/:id/scan
   * Record a QR code scan event
   * Rate limit: 1000 requests per minute
   */
  router.post(
    "/:id/scan",
    rateLimitMiddleware({ windowMs: 60000, max: 1000 }),
    (req, res, next) => businessController.recordScan(req, res, next)
  );

  /**
   * POST /api/v1/businesses/:id/contact-click
   * Record contact information click
   * Rate limit: 1000 requests per minute
   */
  router.post(
    "/:id/contact-click",
    rateLimitMiddleware({ windowMs: 60000, max: 1000 }),
    (req, res, next) => businessController.recordContactClick(req, res, next)
  );

  return router;
}
