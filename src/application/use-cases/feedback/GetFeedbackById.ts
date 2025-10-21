import { IFeedbackRepository } from "@domain/interfaces/IFeedbackRepository";
import { AppError } from "@shared/errors/AppError";

export class GetFeedbackByIdUseCase {
  constructor(private feedbackRepository: IFeedbackRepository) {}

  async execute(feedbackId: string, userId: string, isAdmin: boolean = false) {
    if (!feedbackId) {
      throw new AppError("Feedback ID is required", 400);
    }

    const feedback = await this.feedbackRepository.findById(feedbackId);
    if (!feedback) {
      throw new AppError("Feedback not found", 404);
    }

    // Check authorization
    if (!isAdmin && feedback.userId !== userId) {
      throw new AppError("You can only view your own feedback", 403);
    }

    return feedback.toJSON();
  }
}
