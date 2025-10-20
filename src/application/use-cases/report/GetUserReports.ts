import { IReportRepository } from "@domain/interfaces/IReportRepository";
import { AppError } from "@shared/errors/AppError";

export class GetUserReportsUseCase {
  constructor(private reportRepository: IReportRepository) {}

  async execute(userId: string) {
    if (!userId) {
      throw new AppError("User ID is required", 400);
    }

    const reports = await this.reportRepository.findByUserId(userId);

    return {
      reports: reports.map((r) => r.toJSON()),
      total: reports.length,
    };
  }
}
