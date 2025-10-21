import { IFeedbackRepository } from "@domain/interfaces/IFeedbackRepository";
import { AppError } from "@shared/errors/AppError";
export class DeleteFeedbackUseCase {
  constructor(private feedbackRepository: IFeedbackRepository) {}

  async execute(feedbackId: string, userId: string): Promise<void> {
    if (!feedbackId) {
      throw new AppError("Feedback ID is required", 400);
    }

    const feedback = await this.feedbackRepository.findById(feedbackId);
    if (!feedback) {
      throw new AppError("Feedback not found", 404);
    }

    if (feedback.userId !== userId) {
      throw new AppError("You can only delete your own feedback", 403);
    }

    const deleted = await this.feedbackRepository.delete(feedbackId);
    if (!deleted) {
      throw new AppError("Failed to delete feedback", 500);
    }
  }
}
