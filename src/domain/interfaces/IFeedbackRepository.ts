// src/domain/interfaces/IFeedbackRepository.ts

import { Feedback } from "@domain/entities/Feedback";

export interface IFeedbackRepository {
  create(feedback: Feedback): Promise<Feedback>;
  findById(id: string): Promise<Feedback | null>;
  findByUserId(userId: string): Promise<Feedback[]>;
  findByCardId(cardId: string): Promise<Feedback[]>;
  findAll(
    page: number,
    limit: number,
    filters?: {
      status?: string;
      feedback_type?: string;
      rating?: number;
    }
  ): Promise<{ feedbacks: Feedback[]; total: number }>;
  update(id: string, feedback: Feedback): Promise<Feedback | null>;
  delete(id: string): Promise<boolean>;
  exists(id: string): Promise<boolean>;
  isOwner(feedbackId: string, userId: string): Promise<boolean>;
  count(filters?: any): Promise<number>;
  getStats(): Promise<{
    pending: number;
    reviewed: number;
    resolved: number;
    average_rating: number;
  }>;
}
