export type PackageTier = "free" | "basic" | "premium" | "business";
export type BillingInterval = "month" | "year";

export interface PackageFeatures {
  maxCards: number;
  maxBoosts: number;
  canExploreCards: boolean;
  prioritySupport: boolean;
  verificationBadge: boolean;
  advancedAnalytics: boolean;
  customBranding: boolean;
  apiAccess: boolean;
}

export interface Package {
  id: string;
  name: string;
  tier: PackageTier;
  price: number;
  currency: string;
  interval: BillingInterval;
  features: PackageFeatures;
  description: string;
  isActive: boolean;
  scheduledActivateAt?: Date;
  scheduledDeactivateAt?: Date;
  subscriberCount?: number;
  revenue?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePackageData {
  name: string;
  tier: PackageTier;
  price: number;
  currency: string;
  interval: BillingInterval;
  features: PackageFeatures;
  description: string;
  isActive?: boolean;
}

export interface UpdatePackageData extends Partial<CreatePackageData> {
  scheduledActivateAt?: Date;
  scheduledDeactivateAt?: Date;
}
