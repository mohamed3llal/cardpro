import { IFeedbackRepository } from "@domain/interfaces/IFeedbackRepository";
import { AppError } from "@shared/errors/AppError";

export class GetAllFeedbackUseCase {
  constructor(private feedbackRepository: IFeedbackRepository) {}

  async execute(
    page: number = 1,
    limit: number = 50,
    filters?: { status?: string; feedback_type?: string; rating?: number }
  ) {
    const { feedbacks, total } = await this.feedbackRepository.findAll(
      page,
      limit,
      filters
    );

    const totalPages = Math.ceil(total / limit);
    const stats = await this.feedbackRepository.getStats();

    return {
      feedback: feedbacks.map((f) => f.toJSON()),
      pagination: {
        current_page: page,
        total_pages: totalPages,
        total_feedback: total,
        per_page: limit,
      },
      stats,
    };
  }
}

// src/application/use-cases/feedback/UpdateFeedbackStatus.ts (Admin)
export interface UpdateFeedbackStatusDTO {
  status: "pending" | "reviewed" | "resolved";
  admin_notes?: string;
}

export class UpdateFeedbackStatusUseCase {
  constructor(private feedbackRepository: IFeedbackRepository) {}

  async execute(
    feedbackId: string,
    adminId: string,
    dto: UpdateFeedbackStatusDTO
  ) {
    if (!feedbackId) {
      throw new AppError("Feedback ID is required", 400);
    }

    const feedback = await this.feedbackRepository.findById(feedbackId);
    if (!feedback) {
      throw new AppError("Feedback not found", 404);
    }

    feedback.updateStatus(dto.status, adminId, dto.admin_notes);

    const updated = await this.feedbackRepository.update(feedbackId, feedback);

    if (!updated) {
      throw new AppError("Failed to update feedback status", 500);
    }

    return updated.toJSON();
  }
}
