import { IFeedbackRepository } from "@domain/interfaces/IFeedbackRepository";

export class GetUserFeedbackUseCase {
  constructor(private feedbackRepository: IFeedbackRepository) {}

  async execute(userId: string) {
    const feedbacks = await this.feedbackRepository.findByUserId(userId);
    const total = feedbacks.length;

    return {
      feedback: feedbacks.map((f) => f.toJSON()),
      total,
    };
  }
}
