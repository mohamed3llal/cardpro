import { Package } from "./Package";

export type SubscriptionStatus =
  | "active"
  | "inactive"
  | "expired"
  | "cancelled";
export type BoostStatus = "active" | "expired";

export interface UserPackage {
  id: string;
  userId: string;
  packageId: string;
  package?: Package;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  paymentMethodId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PackageUsage {
  id: string;
  userId: string;
  packageId: string;
  cardsCreated: number;
  boostsUsed: number;
  periodStart: Date;
  periodEnd: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface BoostCard {
  id: string;
  cardId: string;
  userId: string;
  duration: number;
  startDate: Date;
  endDate: Date;
  status: BoostStatus;
  impressions: number;
  clicks: number;
  createdAt: Date;
}

export interface CreateSubscriptionData {
  userId: string;
  packageId: string;
  paymentMethodId?: string;
}

export interface CancelSubscriptionData {
  reason?: string;
  cancelImmediately?: boolean;
}

export interface BoostCardData {
  cardId: string;
  userId: string;
  duration: number;
}
