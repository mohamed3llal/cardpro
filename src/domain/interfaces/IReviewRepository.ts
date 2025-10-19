// src/domain/interfaces/IReviewRepository.ts

import { Review } from "@domain/entities/Review";

export interface ReviewStats {
  average_rating: number;
  total_reviews: number;
  rating_distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface PaginatedReviews {
  reviews: Review[];
  stats: ReviewStats;
  pagination: {
    current_page: number;
    total_pages: number;
    total_reviews: number;
    limit: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export interface IReviewRepository {
  // Create a review
  create(review: Review): Promise<Review>;

  // Find reviews
  findById(reviewId: string): Promise<Review | null>;
  findByBusinessId(
    businessId: string,
    page: number,
    limit: number
  ): Promise<PaginatedReviews>;
  findByUserId(userId: string): Promise<Review[]>;

  // Update review
  update(reviewId: string, review: Review): Promise<Review | null>;

  // Delete review
  delete(reviewId: string): Promise<boolean>;

  // Check operations
  exists(reviewId: string): Promise<boolean>;
  hasUserReviewed(userId: string, businessId: string): Promise<boolean>;
  isOwner(reviewId: string, userId: string): Promise<boolean>;

  // Statistics
  getBusinessStats(businessId: string): Promise<ReviewStats>;

  // Helpful votes
  markAsHelpful(reviewId: string, userId: string): Promise<boolean>;
  unmarkAsHelpful(reviewId: string, userId: string): Promise<boolean>;
  hasMarkedHelpful(reviewId: string, userId: string): Promise<boolean>;

  // Admin operations
  findAll(
    page: number,
    limit: number,
    status?: string
  ): Promise<{
    reviews: Review[];
    pagination: {
      current_page: number;
      total_pages: number;
      total_reviews: number;
      per_page: number;
    };
  }>;

  count(query?: any): Promise<number>;
}
