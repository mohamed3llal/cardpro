// src/infrastructure/database/repositories/FeedbackRepository.ts

import { Feedback } from "@domain/entities/Feedback";
import { IFeedbackRepository } from "@domain/interfaces/IFeedbackRepository";
import { FeedbackModel } from "@infrastructure/database/models/FeedbackModel";

export class FeedbackRepository implements IFeedbackRepository {
  async create(feedback: Feedback): Promise<Feedback> {
    const feedbackDoc = await FeedbackModel.create(feedback.toJSON());
    return Feedback.fromPersistence(feedbackDoc);
  }

  async findById(id: string): Promise<Feedback | null> {
    const feedback = await FeedbackModel.findById(id).lean();
    return feedback ? Feedback.fromPersistence(feedback) : null;
  }

  async findByUserId(userId: string): Promise<Feedback[]> {
    const feedbacks = await FeedbackModel.find({ user_id: userId })
      .sort({ created_at: -1 })
      .lean();
    return feedbacks.map((f) => Feedback.fromPersistence(f));
  }

  async findByCardId(cardId: string): Promise<Feedback[]> {
    const feedbacks = await FeedbackModel.find({ card_id: cardId })
      .sort({ created_at: -1 })
      .lean();
    return feedbacks.map((f) => Feedback.fromPersistence(f));
  }

  async findAll(
    page: number = 1,
    limit: number = 50,
    filters?: {
      status?: string;
      feedback_type?: string;
      rating?: number;
    }
  ): Promise<{ feedbacks: Feedback[]; total: number }> {
    const skip = (page - 1) * limit;
    const query: any = {};

    if (filters?.status && filters.status !== "all") {
      query.status = filters.status;
    }

    if (filters?.feedback_type && filters.feedback_type !== "all") {
      query.feedback_type = filters.feedback_type;
    }

    if (filters?.rating) {
      query.rating = filters.rating;
    }

    const [feedbacks, total] = await Promise.all([
      FeedbackModel.find(query)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      FeedbackModel.countDocuments(query),
    ]);

    return {
      feedbacks: feedbacks.map((f) => Feedback.fromPersistence(f)),
      total,
    };
  }

  async update(id: string, feedback: Feedback): Promise<Feedback | null> {
    const { id: _, ...data } = feedback.toJSON();
    const updated = await FeedbackModel.findByIdAndUpdate(id, data, {
      new: true,
    }).lean();
    return updated ? Feedback.fromPersistence(updated) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await FeedbackModel.findByIdAndDelete(id);
    return !!result;
  }

  async exists(id: string): Promise<boolean> {
    const count = await FeedbackModel.countDocuments({ _id: id });
    return count > 0;
  }

  async isOwner(feedbackId: string, userId: string): Promise<boolean> {
    const feedback = await FeedbackModel.findOne({
      _id: feedbackId,
      user_id: userId,
    });
    return !!feedback;
  }

  async count(filters?: any): Promise<number> {
    return await FeedbackModel.countDocuments(filters || {});
  }

  async getStats(): Promise<{
    pending: number;
    reviewed: number;
    resolved: number;
    average_rating: number;
  }> {
    const [stats, avgRating] = await Promise.all([
      FeedbackModel.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
      FeedbackModel.aggregate([
        {
          $match: { rating: { $exists: true, $ne: null } },
        },
        {
          $group: {
            _id: null,
            average: { $avg: "$rating" },
          },
        },
      ]),
    ]);

    const statsMap: any = {};
    stats.forEach((s) => {
      statsMap[s._id] = s.count;
    });

    return {
      pending: statsMap.pending || 0,
      reviewed: statsMap.reviewed || 0,
      resolved: statsMap.resolved || 0,
      average_rating: avgRating[0]?.average || 0,
    };
  }
}
