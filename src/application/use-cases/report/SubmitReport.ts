import { Report } from "@domain/entities/Report";
import { IReportRepository } from "@domain/interfaces/IReportRepository";
import { ICardRepository } from "@domain/interfaces/ICardRepository";
import { AppError } from "@shared/errors/AppError";

export interface SubmitReportDTO {
  card_id: string;
  user_id: string;
  report_type: "inappropriate" | "incorrect" | "spam" | "copyright" | "other";
  details?: string;
  status?: string;
}

export class SubmitReportUseCase {
  constructor(
    private reportRepository: IReportRepository,
    private cardRepository: ICardRepository
  ) {}

  async execute(dto: SubmitReportDTO): Promise<Report> {
    // Validate business card exists
    const cardExists = await this.cardRepository.exists(dto.card_id);
    if (!cardExists) {
      throw new AppError("Business card not found", 404);
    }

    // Check if user already reported this card
    const existingReport = await this.reportRepository.findByCardAndUser(
      dto.card_id,
      dto.user_id
    );
    if (existingReport) {
      throw new AppError("You have already reported this business card", 409);
    }

    const report = Report.create({
      card_id: dto.card_id,
      user_id: dto.user_id,
      report_type: dto.report_type,
      details: dto.details,
      status: "pending",
    });

    return await this.reportRepository.create(report);
  }
}
