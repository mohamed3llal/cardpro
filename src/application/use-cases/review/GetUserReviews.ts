import { IReviewRepository } from "@domain/interfaces/IReviewRepository";

export class GetUserReviewsUseCase {
  constructor(private reviewRepository: IReviewRepository) {}

  async execute(userId: string) {
    const reviews = await this.reviewRepository.findByUserId(userId);
    return { reviews };
  }
}
