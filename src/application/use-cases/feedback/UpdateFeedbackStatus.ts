// src/application/use-cases/feedback/UpdateFeedbackStatus.ts
import { IFeedbackRepository } from "@domain/interfaces/IFeedbackRepository";
import { AppError } from "@shared/errors/AppError";

export class UpdateFeedbackStatusUseCase {
  constructor(private feedbackRepository: IFeedbackRepository) {}

  async execute(feedbackId: string, adminId: string, dto: any) {
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
