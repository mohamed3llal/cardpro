import { IReviewRepository } from "@domain/interfaces/IReviewRepository";
import { Review } from "@domain/entities/Review";
import { AppError } from "@shared/errors/AppError";

export interface GetAllReviewsFilters {
  status?: string;
  rating?: number;
  business_id?: string;
  flagged?: boolean;
}

export interface GetAllReviewsResponse {
  reviews: Review[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_reviews: number;
    per_page: number;
  };
  stats: {
    total: number;
    flagged: number;
    average_rating: number;
  };
}

export class GetAllReviewsUseCase {
  constructor(private reviewRepository: IReviewRepository) {}

  async execute(
    page: number = 1,
    limit: number = 50,
    filters?: GetAllReviewsFilters
  ): Promise<GetAllReviewsResponse> {
    try {
      // Validate pagination
      if (page < 1) {
        throw new AppError("Page must be at least 1", 400);
      }

      if (limit < 1 || limit > 100) {
        throw new AppError("Limit must be between 1 and 100", 400);
      }

      // Get reviews with pagination
      const result = await this.reviewRepository.findAll(
        page,
        limit,
        filters?.status
      );

      // Get statistics
      const totalReviews = await this.reviewRepository.count();
      const flaggedCount = await this.reviewRepository.count({
        is_flagged: true,
      });

      // Calculate average rating
      const allReviews = await this.reviewRepository.findAll(1, totalReviews);
      const averageRating =
        allReviews.reviews.length > 0
          ? allReviews.reviews.reduce((sum, r) => sum + r.rating, 0) /
            allReviews.reviews.length
          : 0;

      return {
        reviews: result.reviews,
        pagination: result.pagination,
        stats: {
          total: totalReviews,
          flagged: flaggedCount,
          average_rating: Math.round(averageRating * 10) / 10,
        },
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Failed to fetch reviews", 500);
    }
  }
}
