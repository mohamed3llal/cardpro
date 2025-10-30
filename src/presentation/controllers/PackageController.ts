// src/presentation/controllers/PackageController.ts (Updated methods)

import { Request, Response } from "express";
import { ResponseHandler } from "../../shared/utils/ResponseHandler";
import { AuthRequest } from "@infrastructure/middleware/authMiddleware";
import { GetPackageUsage } from "@application/use-cases/package/GetPackageUsage";
import { BoostCardUseCase } from "@application/use-cases/package/BoostCard";
import { GetActiveBoosts } from "@application/use-cases/package/GetActiveBoosts";
import {
  PackageDTO,
  UserPackageDTO,
  PackageUsageDTO,
  BoostCardDTO,
} from "@application/dtos/PackageDTO";

export class PackageController {
  constructor(
    private getPackageUsage: GetPackageUsage,
    private boostCard: BoostCardUseCase,
    private packageRepository: any
  ) {}

  // ✅ UPDATED: Get usage with remaining boost points
  async getUsage(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId: any = req.userId;

      if (!userId) {
        ResponseHandler.error(res, "User not authenticated", 401);
        return;
      }

      const { usage, package: pkg } = await this.getPackageUsage.execute(
        userId
      );

      // Calculate remaining boost points
      const remainingBoostPoints = Math.max(
        0,
        pkg.features.maxBoosts - usage.boostsUsed
      );

      const usageDTO = PackageUsageDTO.fromEntity(usage, pkg);

      ResponseHandler.success(res, {
        ...usageDTO,
        remainingBoostPoints, // ✅ NEW: Add remaining points
        boostPointsInfo: {
          total: pkg.features.maxBoosts,
          used: usage.boostsUsed,
          remaining: remainingBoostPoints,
          note: "Each boost point = 1 day of promotion",
        },
      });
    } catch (error: any) {
      console.error(`❌ Error in PackageController.getUsage:`, error);
      ResponseHandler.error(res, error.message, error.statusCode || 500);
    }
  }

  // ✅ UPDATED: Boost card with points validation
  async boostCardById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId: any = req.userId;
      const { cardId } = req.params;
      const { duration } = req.body;

      // Validate duration
      if (!duration || duration < 1 || duration > 30) {
        ResponseHandler.error(
          res,
          "Duration must be between 1 and 30 days",
          400
        );
        return;
      }

      // Check remaining boost points before attempting
      const remainingPoints =
        await this.packageRepository.getRemainingBoostPoints(userId);

      if (remainingPoints < duration) {
        ResponseHandler.error(
          res,
          `Insufficient boost points. You have ${remainingPoints} point(s) remaining. Each day requires 1 point. You need ${duration} points for ${duration} day(s).`,
          400
        );
        return;
      }

      const boost = await this.boostCard.execute({
        userId,
        cardId,
        duration,
      });

      const boostDTO = BoostCardDTO.fromEntity(boost);

      ResponseHandler.success(
        res,
        {
          boost: boostDTO,
          pointsUsed: duration,
          remainingPoints: remainingPoints - duration,
          message: `Card boosted successfully for ${duration} day(s). ${duration} boost point(s) consumed.`,
        },
        201
      );
    } catch (error: any) {
      ResponseHandler.error(res, error.message, error.statusCode || 500);
    }
  }

  // ✅ NEW: Get boost statistics for a card
  async getCardBoostStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { cardId } = req.params;

      const stats = await this.packageRepository.getBoostStats(cardId);

      ResponseHandler.success(res, {
        cardId,
        stats: {
          totalBoosts: stats.totalBoosts,
          totalDaysPromoted: stats.totalDays,
          totalImpressions: stats.totalImpressions,
          totalClicks: stats.totalClicks,
          averageClickRate:
            stats.totalImpressions > 0
              ? ((stats.totalClicks / stats.totalImpressions) * 100).toFixed(
                  2
                ) + "%"
              : "0%",
        },
      });
    } catch (error: any) {
      ResponseHandler.error(res, error.message, error.statusCode || 500);
    }
  }

  // ✅ NEW: Get remaining boost points
  async getRemainingBoostPoints(
    req: AuthRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId: any = req.userId;

      const remainingPoints =
        await this.packageRepository.getRemainingBoostPoints(userId);

      ResponseHandler.success(res, {
        remainingPoints,
        message: `You have ${remainingPoints} boost point(s) available. Each point = 1 day of promotion.`,
      });
    } catch (error: any) {
      ResponseHandler.error(res, error.message, error.statusCode || 500);
    }
  }
}
