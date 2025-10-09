export interface DashboardStats {
  totalCards: number;
  totalViews: number;
  totalScans: number;
  publicCards: number;
  privateCards: number;
  verifiedCards: number;
  pendingVerification: number;
  monthlyGrowth: {
    views: number;
    scans: number;
  };
}

export interface IAnalyticsRepository {
  getDashboardStats(userId: string): Promise<DashboardStats>;
  getCardAnalytics(cardId: string, period: string): Promise<any>;
  getRecentActivity(userId: string, limit: number): Promise<any[]>;
}
