// src/presentation/routes/favoriteRoutes.ts

import { Router } from "express";
import { FavoriteController } from "@presentation/controllers/FavoriteController";
import { authMiddleware } from "@infrastructure/middleware/authMiddleware";
import { IAuthService } from "@domain/interfaces/IAuthServices";
import rateLimit from "express-rate-limit";

// Rate limiter for favorites
const favoritesRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // 100 add/remove operations per hour
  message: "Too many favorite operations, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

export const createFavoriteRoutes = (
  favoriteController: FavoriteController,
  authService: IAuthService
): Router => {
  const router = Router();
  const auth = authMiddleware(authService);

  /**
   * GET /api/v1/favorites
   * Get all favorite business IDs
   */
  router.get("/", auth, favoriteController.getUserFavorites);

  /**
   * POST /api/v1/favorites
   * Add a business to favorites
   */
  router.post("/", auth, favoritesRateLimit, favoriteController.addToFavorites);

  /**
   * DELETE /api/v1/favorites/:business_id
   * Remove a business from favorites
   */
  router.delete(
    "/:business_id",
    auth,
    favoritesRateLimit,
    favoriteController.removeFromFavorites
  );

  /**
   * GET /api/v1/favorites/check/:business_id
   * Check if a business is favorited
   */
  router.get("/check/:business_id", auth, favoriteController.checkIsFavorited);

  /**
   * GET /api/v1/favorites/businesses
   * Get full details of all favorited businesses (paginated)
   */
  router.get("/businesses", auth, favoriteController.getFavoriteBusinesses);

  return router;
};
