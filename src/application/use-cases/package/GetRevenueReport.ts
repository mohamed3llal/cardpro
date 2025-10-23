import { IPackageRepository } from "@domain/interfaces/IPackageRepository";

export class GetRevenueReport {
  constructor(private packageRepository: IPackageRepository) {}

  async execute(startDate?: Date, endDate?: Date): Promise<any> {
    try {
      const report = await this.packageRepository.getRevenueReport(
        startDate,
        endDate
      );
      return report;
    } catch (error) {
      console.error("Error in GetRevenueReport:", error);
      // Return empty report instead of throwing
      return {
        totalRevenue: 0,
        subscriptionCount: 0,
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
      };
    }
  }
}
