// src/presentation/controllers/FavoriteController.ts

import { Response, NextFunction } from "express";
import { AuthRequest } from "@infrastructure/middleware/authMiddleware";
import { AddToFavoritesUseCase } from "@application/use-cases/favorite/AddToFavorites";
import { RemoveFromFavoritesUseCase } from "@application/use-cases/favorite/RemoveFromFavorites";
import { GetUserFavoritesUseCase } from "@application/use-cases/favorite/GetUserFavorites";
import { GetFavoriteBusinessesUseCase } from "@application/use-cases/favorite/GetFavoriteBusinesses";
import { CheckIsFavoritedUseCase } from "@application/use-cases/favorite/CheckIsFavorited";
import { logger } from "@config/logger";

export class FavoriteController {
  constructor(
    private readonly addToFavoritesUseCase: AddToFavoritesUseCase,
    private readonly removeFromFavoritesUseCase: RemoveFromFavoritesUseCase,
    private readonly getUserFavoritesUseCase: GetUserFavoritesUseCase,
    private readonly getFavoriteBusinessesUseCase: GetFavoriteBusinessesUseCase,
    private readonly checkIsFavoritedUseCase: CheckIsFavoritedUseCase
  ) {}

  /**
   * GET /api/v1/favorites
   * Get all favorite business IDs for authenticated user
   */
  getUserFavorites = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: "Authentication required",
        });
        return;
      }

      const result = await this.getUserFavoritesUseCase.execute(userId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error("Error getting user favorites:", error);
      next(error);
    }
  };

  /**
   * POST /api/v1/favorites
   * Add a business to favorites
   */
  addToFavorites = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.userId;
      const { business_id } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: "Authentication required",
        });
        return;
      }

      if (!business_id) {
        res.status(400).json({
          success: false,
          error: "business_id is required",
        });
        return;
      }

      const favorite = await this.addToFavoritesUseCase.execute({
        user_id: userId,
        business_id,
      });

      res.status(201).json({
        success: true,
        data: {
          business_id: favorite.businessId,
          created_at: favorite.createdAt?.toISOString(),
        },
        message: "Business added to favorites",
      });
    } catch (error: any) {
      if (error.message === "Business not found") {
        res.status(404).json({
          success: false,
          error: "Business not found",
        });
        return;
      }

      if (error.message === "Business already in favorites") {
        res.status(400).json({
          success: false,
          error: "Business already in favorites",
        });
        return;
      }

      logger.error("Error adding to favorites:", error);
      next(error);
    }
  };

  /**
   * DELETE /api/v1/favorites/:business_id
   * Remove a business from favorites
   */
  removeFromFavorites = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.userId;
      const { business_id } = req.params;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: "Authentication required",
        });
        return;
      }

      await this.removeFromFavoritesUseCase.execute({
        user_id: userId,
        business_id,
      });

      res.status(200).json({
        success: true,
        message: "Business removed from favorites",
      });
    } catch (error: any) {
      if (error.message === "Business not found in favorites") {
        res.status(404).json({
          success: false,
          error: "Business not found in favorites",
        });
        return;
      }

      logger.error("Error removing from favorites:", error);
      next(error);
    }
  };

  /**
   * GET /api/v1/favorites/check/:business_id
   * Check if a business is favorited
   */
  checkIsFavorited = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.userId;
      const { business_id } = req.params;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: "Authentication required",
        });
        return;
      }

      const result = await this.checkIsFavoritedUseCase.execute({
        user_id: userId,
        business_id,
      });

      res.status(200).json({
        success: true,
        data: {
          is_favorite: result.is_favorite,
          created_at: result.created_at?.toISOString(),
        },
      });
    } catch (error) {
      logger.error("Error checking favorite status:", error);
      next(error);
    }
  };

  /**
   * GET /api/v1/favorites/businesses
   * Get full details of all favorited businesses
   */
  getFavoriteBusinesses = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: "Authentication required",
        });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

      const result = await this.getFavoriteBusinessesUseCase.execute({
        user_id: userId,
        page,
        limit,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error("Error getting favorite businesses:", error);
      next(error);
    }
  };
}
