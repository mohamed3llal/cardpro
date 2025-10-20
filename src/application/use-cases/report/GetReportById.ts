import { IReportRepository } from "@domain/interfaces/IReportRepository";
import { AppError } from "@shared/errors/AppError";

export class GetReportByIdUseCase {
  constructor(private reportRepository: IReportRepository) {}

  async execute(reportId: string, userId: string, isAdmin: boolean = false) {
    if (!reportId) {
      throw new AppError("Report ID is required", 400);
    }

    const report = await this.reportRepository.findById(reportId);
    if (!report) {
      throw new AppError("Report not found", 404);
    }

    // Check authorization
    if (!isAdmin && report.userId !== userId) {
      throw new AppError("You can only view your own reports", 403);
    }

    return report.toJSON();
  }
}
