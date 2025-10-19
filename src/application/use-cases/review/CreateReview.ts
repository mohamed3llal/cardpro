import { Review } from "@domain/entities/Review";
import { IReviewRepository } from "@domain/interfaces/IReviewRepository";
import { ICardRepository } from "@domain/interfaces/ICardRepository";
import { AppError } from "@shared/errors/AppError";

export interface CreateReviewDTO {
  user_id: string;
  business_id: string;
  rating: number;
  title: string;
  comment: string;
}

export class CreateReviewUseCase {
  constructor(
    private reviewRepository: IReviewRepository,
    private cardRepository: ICardRepository
  ) {}

  async execute(
    dto: CreateReviewDTO,
    userName: string,
    userAvatar?: string
  ): Promise<Review> {
    // Check if business exists
    const business = await this.cardRepository.findById(dto.business_id);
    if (!business) {
      throw new AppError("Business not found", 404);
    }

    // Check if user already reviewed
    const hasReviewed = await this.reviewRepository.hasUserReviewed(
      dto.user_id,
      dto.business_id
    );

    if (hasReviewed) {
      throw new AppError("You have already reviewed this business", 409);
    }

    // Create review
    const review = Review.create({
      business_id: dto.business_id,
      user_id: dto.user_id,
      user_name: userName,
      user_avatar: userAvatar,
      rating: dto.rating,
      title: dto.title,
      comment: dto.comment,
    });

    return await this.reviewRepository.create(review);
  }
}
