import { Review } from "@domain/entities/Review";
import { IReviewRepository } from "@domain/interfaces/IReviewRepository";
import { AppError } from "@shared/errors/AppError";

export interface UpdateReviewDTO {
  rating?: number;
  title?: string;
  comment?: string;
}

export class UpdateReviewUseCase {
  constructor(private reviewRepository: IReviewRepository) {}

  async execute(
    reviewId: string,
    userId: string,
    dto: UpdateReviewDTO
  ): Promise<Review> {
    // Check if review exists
    const review = await this.reviewRepository.findById(reviewId);
    if (!review) {
      throw new AppError("Review not found", 404);
    }

    // Check ownership
    const isOwner = await this.reviewRepository.isOwner(reviewId, userId);
    if (!isOwner) {
      throw new AppError("You can only edit your own reviews", 403);
    }

    // Update review
    review.update(dto);

    const updated = await this.reviewRepository.update(reviewId, review);
    if (!updated) {
      throw new AppError("Failed to update review", 500);
    }

    return updated;
  }
}
