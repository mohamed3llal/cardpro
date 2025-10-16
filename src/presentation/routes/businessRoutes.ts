// src/presentation/routes/businessRoutes.ts

import { Router } from "express";
import { BusinessController } from "@presentation/controllers/BusinessController";
import rateLimit from "express-rate-limit";

// Rate limiters for different endpoint types
const searchRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100,
  message: "Too many search requests, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

const detailRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 200,
  message: "Too many requests, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

const analyticsRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 1000,
  message: "Too many requests, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

export const createBusinessRoutes = (
  businessController: BusinessController
): Router => {
  const router = Router();

  // ============================================
  // Search & Discovery Endpoints (Public)
  // ============================================

  /**
   * GET /businesses/search
   * Search and filter businesses with advanced options
   * Rate limit: 100 requests per minute per IP
   */
  router.get("/search", searchRateLimit, businessController.searchBusinesses);

  /**
   * GET /businesses/featured
   * Get curated featured businesses for home page display
   * Rate limit: 100 requests per minute per IP
   */
  router.get(
    "/featured",
    searchRateLimit,
    businessController.getFeaturedBusinesses
  );

  /**
   * GET /businesses/:id
   * Get detailed information about a specific business
   * Rate limit: 200 requests per minute per IP
   */
  router.get("/:id", detailRateLimit, businessController.getBusinessById);

  /**
   * GET /businesses/:id/similar
   * Get businesses similar to the specified business
   * Rate limit: 200 requests per minute per IP
   */

  // router.get(
  //   "/:id/similar",
  //   detailRateLimit,
  //   businessController.getSimilarBusinesses
  // );

  // ============================================
  // Analytics Tracking Endpoints (Public)
  // ============================================

  /**
   * POST /businesses/:id/view
   * Record a view event for analytics
   * Rate limit: 1000 requests per minute per IP
   */
  router.post("/:id/view", analyticsRateLimit, businessController.recordView);

  /**
   * POST /businesses/:id/scan
   * Record a QR code scan event
   * Rate limit: 1000 requests per minute per IP
   */
  router.post("/:id/scan", analyticsRateLimit, businessController.recordScan);

  /**
   * POST /businesses/:id/contact-click
   * Record a contact click event
   * Rate limit: 1000 requests per minute per IP
   */
  router.post(
    "/:id/contact-click",
    analyticsRateLimit,
    businessController.recordContactClick
  );

  return router;
};
