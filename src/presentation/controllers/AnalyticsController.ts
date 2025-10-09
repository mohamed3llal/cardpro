import { Response, NextFunction } from "express";
import { AuthRequest } from "@infrastructure/middleware/authMiddleware";
import { GetDashboardStatsUseCase } from "@application/use-cases/analytics/GetDashboardStats";
import { IAnalyticsRepository } from "@domain/interfaces/IAnalyticsRepository";

export class AnalyticsController {
  constructor(
    private getDashboardStatsUseCase: GetDashboardStatsUseCase,
    private analyticsRepository: IAnalyticsRepository
  ) {}

  getDashboardStats = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.userId!;
      const stats = await this.getDashboardStatsUseCase.execute(userId);
      res.status(200).json({ stats });
    } catch (error) {
      next(error);
    }
  };

  getCardAnalytics = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { cardId } = req.params;
      const period = (req.query.period as string) || "30d";
      const analytics = await this.analyticsRepository.getCardAnalytics(
        cardId,
        period
      );
      res.status(200).json(analytics);
    } catch (error) {
      next(error);
    }
  };

  getRecentActivity = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.userId!;
      const limit = parseInt(req.query.limit as string) || 10;
      const activity = await this.analyticsRepository.getRecentActivity(
        userId,
        limit
      );
      res.status(200).json({ recent_activity: activity });
    } catch (error) {
      next(error);
    }
  };
}
