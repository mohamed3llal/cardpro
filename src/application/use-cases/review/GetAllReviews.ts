// GetAllReviews.ts
import { IReviewRepository } from "@domain/interfaces/IReviewRepository";
import { Review } from "@domain/entities/Review";

export class GetAllReviewsUseCase {
  constructor(private reviewRepository: IReviewRepository) {}

  async execute(): Promise<Review[]> {}
}
