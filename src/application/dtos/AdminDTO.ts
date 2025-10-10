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
  status: "active" | "suspended";
  card_count: number;
  created_at: string;
}

export interface AdminCardDTO {
  id: string;
  name: string;
  title: string;
  company: string;
  domain: string;
  is_public: boolean;
  view_count: number;
  created_at: string;
  user_id: string;
  user_email: string;
}

export interface AnalyticsDTO {
  date: string;
  views: number;
  cards: number;
  users: number;
}

export interface ReportDTO {
  id: string;
  card_id: string;
  reporter_id: string;
  reason: string;
  description: string;
  status: "pending" | "resolved" | "dismissed";
  created_at: string;
  card_name: string;
  reporter_email: string;
}

export interface ReviewDTO {
  id: string;
  business_id: string;
  user_id: string;
  user_name: string;
  rating: number;
  title: string;
  comment: string;
  created_at: string;
}

export interface FeedbackDTO {
  id: string;
  user_id: string;
  user_email: string;
  type: "bug" | "feature" | "general";
  message: string;
  status: "pending" | "reviewed" | "resolved";
  created_at: string;
}

export interface SubscriptionDTO {
  id: string;
  user_id: string;
  user_email: string;
  plan: "free" | "pro" | "premium";
  status: "active" | "cancelled" | "expired";
  expiresAt: string;
  created_at: string;
}
