import { Feedback } from "@domain/entities/Feedback";
import { IFeedbackRepository } from "@domain/interfaces/IFeedbackRepository";
import { ICardRepository } from "@domain/interfaces/ICardRepository";
import { AppError } from "@shared/errors/AppError";

export interface SubmitFeedbackDTO {
  card_id: string;
  user_id: string;
  feedback_type: "general" | "bug" | "feature" | "improvement" | "question";
  subject: string;
  message: string;
  email?: string;
  rating?: number;
}

export class SubmitFeedbackUseCase {
  constructor(
    private feedbackRepository: IFeedbackRepository,
    private cardRepository: ICardRepository
  ) {}

  async execute(dto: SubmitFeedbackDTO): Promise<Feedback> {
    // Validate business card exists
    const cardExists = await this.cardRepository.exists(dto.card_id);
    if (!cardExists) {
      throw new AppError("Business card not found", 404);
    }

    const feedback = Feedback.create({
      card_id: dto.card_id,
      user_id: dto.user_id,
      feedback_type: dto.feedback_type,
      subject: dto.subject,
      message: dto.message,
      email: dto.email,
      rating: dto.rating,
      status: "pending",
    });

    return await this.feedbackRepository.create(feedback);
  }
}
