import {
  IAnalyticsRepository,
  DashboardStats,
} from "@domain/interfaces/IAnalyticsRepository";
import { AppError } from "@shared/errors/AppError";

export class GetDashboardStatsUseCase {
  constructor(private analyticsRepository: IAnalyticsRepository) {}

  async execute(userId: string): Promise<DashboardStats> {
    try {
      return await this.analyticsRepository.getDashboardStats(userId);
    } catch (error) {
      throw new AppError("Failed to retrieve dashboard statistics", 500);
    }
  }
}
