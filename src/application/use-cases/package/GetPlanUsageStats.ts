import { IPackageRepository } from "@domain/interfaces/IPackageRepository";

export class GetPlanUsageStats {
  constructor(private packageRepository: IPackageRepository) {}

  async execute(): Promise<any> {
    try {
      const stats = await this.packageRepository.getPlanUsageStats();
      return stats;
    } catch (error) {
      console.error("Error in GetPlanUsageStats:", error);
      // Return empty stats instead of throwing
      return {
        totalSubscribers: 0,
        byTier: [],
      };
    }
  }
}
