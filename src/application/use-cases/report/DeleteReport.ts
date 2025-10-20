import { IReportRepository } from "@domain/interfaces/IReportRepository";
import { AppError } from "@shared/errors/AppError";

export class DeleteReportUseCase {
  constructor(private reportRepository: IReportRepository) {}

  async execute(reportId: string, userId: string) {
    if (!reportId) {
      throw new AppError("Report ID is required", 400);
    }

    const report = await this.reportRepository.findById(reportId);
    if (!report) {
      throw new AppError("Report not found", 404);
    }

    if (report.userId !== userId) {
      throw new AppError("You can only delete your own reports", 403);
    }

    const deleted = await this.reportRepository.delete(reportId);
    if (!deleted) {
      throw new AppError("Failed to delete report", 500);
    }

    return { message: "Report deleted successfully" };
  }
}
