import { IReviewRepository } from "@domain/interfaces/IReviewRepository";

export class GetBusinessReviewsUseCase {
  constructor(private reviewRepository: IReviewRepository) {}

  async execute(businessId: string, page: number = 1, limit: number = 10) {
    return await this.reviewRepository.findByBusinessId(
      businessId,
      page,
      limit
    );
  }
}
