import {
  Package,
  CreatePackageData,
  UpdatePackageData,
} from "../entities/Package";
import {
  UserPackage,
  PackageUsage,
  BoostCard,
  CreateSubscriptionData,
  BoostCardData,
} from "../entities/Subscription";

export interface IPackageRepository {
  // Package Management
  createPackage(data: CreatePackageData): Promise<Package>;
  getPackageById(id: string): Promise<Package | null>;
  getAllPackages(includeInactive?: boolean): Promise<Package[]>;
  getActivePackages(): Promise<Package[]>;
  updatePackage(id: string, data: UpdatePackageData): Promise<Package | null>;
  deletePackage(id: string): Promise<boolean>;

  // Subscription Management
  createSubscription(data: CreateSubscriptionData): Promise<UserPackage>;
  getUserActiveSubscription(userId: string): Promise<UserPackage | null>;
  getSubscriptionById(id: string): Promise<UserPackage | null>;
  getAllSubscriptions(
    page: number,
    limit: number
  ): Promise<{
    data: UserPackage[];
    total: number;
  }>;
  cancelSubscription(id: string, immediately: boolean): Promise<UserPackage>;
  updateSubscriptionStatus(
    id: string,
    status: string
  ): Promise<UserPackage | null>;

  // Usage Tracking
  getPackageUsage(userId: string): Promise<PackageUsage | null>;
  createPackageUsage(userId: string, packageId: string): Promise<PackageUsage>;
  incrementCardUsage(userId: string): Promise<void>;
  incrementBoostUsage(userId: string): Promise<void>;
  resetUsageCounters(userId: string): Promise<void>;

  // Boost Management
  createBoost(data: BoostCardData): Promise<BoostCard>;
  getActiveBoosts(userId: string): Promise<BoostCard[]>;
  getCardActiveBoost(cardId: string): Promise<BoostCard | null>;
  expireBoost(id: string): Promise<void>;
  updateBoostStats(
    id: string,
    impressions: number,
    clicks: number
  ): Promise<void>;

  // Analytics
  getSubscriberCount(packageId: string): Promise<number>;
  getPackageRevenue(packageId: string): Promise<number>;
  getRevenueReport(startDate?: Date, endDate?: Date): Promise<any>;
  getPlanUsageStats(): Promise<any>;
  getPackageSubscribers(
    packageId: string,
    page: number,
    limit: number
  ): Promise<any>;
}
