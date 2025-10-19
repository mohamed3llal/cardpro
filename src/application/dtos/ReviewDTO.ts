// src/application/dtos/ReviewDTO.ts

export interface CreateReviewDTO {
  business_id: string;
  rating: number;
  title: string;
  comment: string;
}

export interface UpdateReviewDTO {
  rating?: number;
  title?: string;
  comment?: string;
}

export interface ReviewResponseDTO {
  id: string;
  business_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  rating: number;
  title: string;
  comment: string;
  created_at: string;
  updated_at: string;
  helpful_count: number;
  verified_purchase: boolean;
}

export interface ReviewStatsDTO {
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

export interface GetBusinessReviewsResponseDTO {
  reviews: ReviewResponseDTO[];
  stats: ReviewStatsDTO;
  pagination?: {
    current_page: number;
    total_pages: number;
    total_reviews: number;
    limit: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export interface GetUserReviewsResponseDTO {
  reviews: ReviewResponseDTO[];
}

export interface MarkHelpfulResponseDTO {
  message: string;
  helpful_count: number;
}

export interface AdminReviewDTO extends ReviewResponseDTO {
  business_name: string;
  user_email: string;
  is_flagged: boolean;
  flag_reason?: string;
}

export interface GetAdminReviewsResponseDTO {
  reviews: AdminReviewDTO[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_reviews: number;
    per_page: number;
  };
}
