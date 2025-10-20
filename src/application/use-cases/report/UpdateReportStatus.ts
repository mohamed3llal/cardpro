import { IReportRepository } from "@domain/interfaces/IReportRepository";
import { AppError } from "@shared/errors/AppError";

export interface UpdateReportStatusDTO {
  status: "pending" | "resolved" | "dismissed";
  admin_notes?: string;
}

export class UpdateReportStatusUseCase {
  constructor(private reportRepository: IReportRepository) {}

  async execute(reportId: string, adminId: string, dto: UpdateReportStatusDTO) {
    if (!reportId) {
      throw new AppError("Report ID is required", 400);
    }

    const report = await this.reportRepository.findById(reportId);
    if (!report) {
      throw new AppError("Report not found", 404);
    }

    report.updateStatus(dto.status, adminId, dto.admin_notes);
    const updated = await this.reportRepository.update(reportId, report);

    if (!updated) {
      throw new AppError("Failed to update report status", 500);
    }

    return updated.toJSON();
  }
}
