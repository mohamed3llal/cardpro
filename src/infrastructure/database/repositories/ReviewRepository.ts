// src/infrastructure/database/repositories/ReviewRepository.ts

import { Review } from "@domain/entities/Review";
import {
  IReviewRepository,
  ReviewStats,
  PaginatedReviews,
} from "@domain/interfaces/IReviewRepository";
import { ReviewModel } from "@infrastructure/database/models/ReviewModel";
import { CardModel } from "@infrastructure/database/models/CardModel";

export class ReviewRepository implements IReviewRepository {
  async create(review: Review): Promise<Review> {
    try {
      const reviewDoc = await ReviewModel.create(review.toJSON());

      // Update business card rating
      await this.updateBusinessRating(review.businessId);

      return Review.fromPersistence(reviewDoc);
    } catch (error: any) {
      if (error.code === 11000) {
        throw new Error("You have already reviewed this business");
      }
      throw error;
    }
  }

  async findById(reviewId: string): Promise<Review | null> {
    const review = await ReviewModel.findById(reviewId).lean();
    return review ? Review.fromPersistence(review) : null;
  }

  async findByBusinessId(
    businessId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedReviews> {
    const skip = (page - 1) * limit;

    const [reviews, stats, total] = await Promise.all([
      ReviewModel.find({ business_id: businessId })
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.getBusinessStats(businessId),
      ReviewModel.countDocuments({ business_id: businessId }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      reviews: reviews.map((r) => Review.fromPersistence(r)),
      stats,
      pagination: {
        current_page: page,
        total_pages: totalPages,
        total_reviews: total,
        limit,
        has_next: page < totalPages,
        has_prev: page > 1,
      },
    };
  }

  async findByUserId(userId: string): Promise<Review[]> {
    const reviews = await ReviewModel.find({ user_id: userId })
      .sort({ created_at: -1 })
      .lean();

    return reviews.map((r) => Review.fromPersistence(r));
  }

  async update(reviewId: string, review: Review): Promise<Review | null> {
    const { id, business_id, user_id, ...updateData } = review.toJSON();

    const updated = await ReviewModel.findByIdAndUpdate(
      reviewId,
      { ...updateData, updated_at: new Date() },
      { new: true, runValidators: true }
    ).lean();

    if (updated) {
      // Update business card rating
      await this.updateBusinessRating(updated.business_id);
    }

    return updated ? Review.fromPersistence(updated) : null;
  }

  async delete(reviewId: string): Promise<boolean> {
    const review = await ReviewModel.findById(reviewId);
    if (!review) return false;

    const result = await ReviewModel.findByIdAndDelete(reviewId);

    if (result) {
      // Update business card rating after deletion
      await this.updateBusinessRating(result.business_id);
    }

    return !!result;
  }

  async exists(reviewId: string): Promise<boolean> {
    const count = await ReviewModel.countDocuments({ _id: reviewId });
    return count > 0;
  }

  async hasUserReviewed(userId: string, businessId: string): Promise<boolean> {
    const count = await ReviewModel.countDocuments({
      user_id: userId,
      business_id: businessId,
    });
    return count > 0;
  }

  async isOwner(reviewId: string, userId: string): Promise<boolean> {
    const review = await ReviewModel.findOne({
      _id: reviewId,
      user_id: userId,
    });
    return !!review;
  }

  async getBusinessStats(businessId: string): Promise<ReviewStats> {
    const result = await ReviewModel.aggregate([
      { $match: { business_id: businessId } },
      {
        $group: {
          _id: null,
          average_rating: { $avg: "$rating" },
          total_reviews: { $sum: 1 },
          rating_5: {
            $sum: { $cond: [{ $eq: ["$rating", 5] }, 1, 0] },
          },
          rating_4: {
            $sum: { $cond: [{ $eq: ["$rating", 4] }, 1, 0] },
          },
          rating_3: {
            $sum: { $cond: [{ $eq: ["$rating", 3] }, 1, 0] },
          },
          rating_2: {
            $sum: { $cond: [{ $eq: ["$rating", 2] }, 1, 0] },
          },
          rating_1: {
            $sum: { $cond: [{ $eq: ["$rating", 1] }, 1, 0] },
          },
        },
      },
    ]);

    if (result.length === 0) {
      return {
        average_rating: 0,
        total_reviews: 0,
        rating_distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      };
    }

    const stats = result[0];
    return {
      average_rating: Math.round(stats.average_rating * 10) / 10,
      total_reviews: stats.total_reviews,
      rating_distribution: {
        5: stats.rating_5,
        4: stats.rating_4,
        3: stats.rating_3,
        2: stats.rating_2,
        1: stats.rating_1,
      },
    };
  }

  async markAsHelpful(reviewId: string, userId: string): Promise<boolean> {
    const result = await ReviewModel.updateOne(
      { _id: reviewId, helpful_votes: { $ne: userId } },
      {
        $addToSet: { helpful_votes: userId },
        $inc: { helpful_count: 1 },
      }
    );

    return result.modifiedCount > 0;
  }

  async unmarkAsHelpful(reviewId: string, userId: string): Promise<boolean> {
    const result = await ReviewModel.updateOne(
      { _id: reviewId, helpful_votes: userId },
      {
        $pull: { helpful_votes: userId },
        $inc: { helpful_count: -1 },
      }
    );

    return result.modifiedCount > 0;
  }

  async hasMarkedHelpful(reviewId: string, userId: string): Promise<boolean> {
    const review = await ReviewModel.findOne({
      _id: reviewId,
      helpful_votes: userId,
    });
    return !!review;
  }

  async findAll(
    page: number = 1,
    limit: number = 50,
    status?: string
  ): Promise<any> {
    const skip = (page - 1) * limit;
    const query: any = {};

    const [reviews, total] = await Promise.all([
      ReviewModel.find(query)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ReviewModel.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      reviews: reviews.map((r) => Review.fromPersistence(r)),
      pagination: {
        current_page: page,
        total_pages: totalPages,
        total_reviews: total,
        per_page: limit,
      },
    };
  }

  async count(query: any = {}): Promise<number> {
    return await ReviewModel.countDocuments(query);
  }

  // Helper method to update business card rating
  private async updateBusinessRating(businessId: string): Promise<void> {
    try {
      const stats = await this.getBusinessStats(businessId);

      await CardModel.findByIdAndUpdate(businessId, {
        rating: {
          average: stats.average_rating,
          count: stats.total_reviews,
        },
      });
    } catch (error) {
      console.error("Error updating business rating:", error);
    }
  }
}
