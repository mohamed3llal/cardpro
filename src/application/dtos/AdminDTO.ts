// src/application/dtos/AdminDTO.ts

export interface AdminStatsDTO {
  totalUsers: number;
  totalCards: number;
  totalDomains: number;
  totalReports: number;
  activeUsers: number;
  pendingReviews: number;
  monthlyGrowth: number;
  verifiedCards: number;
  premiumUsers: number;
}

export interface AdminUserDTO {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  role: string;
  status: string;
  card_count: number;
  created_at?: Date;
}

export interface AdminCardDTO {
  id: string;
  name: string;
  title: string;
  company: string;
  domain: string;
  is_public: boolean;
  view_count: number;
  created_at?: Date;
  user_id: string;
  user_email: string;
}

export interface AdminReportDTO {
  id: string;
  card_id: string;
  reporter_id: string;
  reason: string;
  description: string;
  status: "pending" | "resolved" | "dismissed";
  created_at: Date;
  card_name: string;
  reporter_email: string;
}

export interface AdminReviewDTO {
  id: string;
  business_id: string;
  user_id: string;
  user_name: string;
  rating: number;
  title: string;
  comment: string;
  created_at: Date;
}

export interface AdminFeedbackDTO {
  id: string;
  user_id: string;
  user_email: string;
  type: string;
  message: string;
  status: "pending" | "reviewed" | "resolved";
  created_at: Date;
}

export interface AdminSubscriptionDTO {
  id: string;
  user_id: string;
  user_email: string;
  plan: "free" | "pro" | "premium";
  status: string;
  expiresAt: Date;
  created_at: Date;
}
