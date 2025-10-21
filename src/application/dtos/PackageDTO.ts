import { Package, PackageFeatures } from "../../domain/entities/Package";
import {
  UserPackage,
  PackageUsage,
  BoostCard,
} from "../../domain/entities/Subscription";

export class PackageDTO {
  id?: string;
  name?: string;
  tier?: string;
  price?: number;
  currency?: string;
  interval?: string;
  features?: PackageFeatures;
  description?: string;
  isActive?: boolean;
  subscriberCount?: number;
  revenue?: number;
  scheduledActivateAt?: string;
  scheduledDeactivateAt?: string;
  createdAt?: string;
  updatedAt?: string;

  static fromEntity(pkg: Package): PackageDTO {
    return {
      id: pkg.id,
      name: pkg.name,
      tier: pkg.tier,
      price: pkg.price,
      currency: pkg.currency,
      interval: pkg.interval,
      features: pkg.features,
      description: pkg.description,
      isActive: pkg.isActive,
      subscriberCount: pkg.subscriberCount,
      revenue: pkg.revenue,
      scheduledActivateAt: pkg.scheduledActivateAt?.toISOString(),
      scheduledDeactivateAt: pkg.scheduledDeactivateAt?.toISOString(),
      createdAt: pkg.createdAt.toISOString(),
      updatedAt: pkg.updatedAt.toISOString(),
    };
  }

  static fromEntities(packages: Package[]): PackageDTO[] {
    return packages.map((pkg) => PackageDTO.fromEntity(pkg));
  }
}

export class UserPackageDTO {
  id?: string;
  userId?: string;
  packageId?: string;
  package?: PackageDTO;
  status?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  createdAt?: string;
  updatedAt?: string;

  static fromEntity(subscription: UserPackage): UserPackageDTO {
    return {
      id: subscription.id,
      userId: subscription.userId,
      packageId: subscription.packageId,
      package: subscription.package
        ? PackageDTO.fromEntity(subscription.package)
        : undefined,
      status: subscription.status,
      currentPeriodStart: subscription.currentPeriodStart.toISOString(),
      currentPeriodEnd: subscription.currentPeriodEnd.toISOString(),
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      createdAt: subscription.createdAt.toISOString(),
      updatedAt: subscription.updatedAt.toISOString(),
    };
  }

  static fromEntities(subscriptions: UserPackage[]): UserPackageDTO[] {
    return subscriptions.map((sub) => UserPackageDTO.fromEntity(sub));
  }
}

export class PackageUsageDTO {
  userId?: string;
  packageId?: string;
  cardsCreated?: number;
  maxCards?: number;
  boostsUsed?: number;
  maxBoosts?: number;
  period?: {
    start: string;
    end: string;
  };

  static fromEntity(usage: PackageUsage, pkg: Package): PackageUsageDTO {
    return {
      userId: usage.userId,
      packageId: usage.packageId,
      cardsCreated: usage.cardsCreated,
      maxCards: pkg.features.maxCards,
      boostsUsed: usage.boostsUsed,
      maxBoosts: pkg.features.maxBoosts,
      period: {
        start: usage.periodStart.toISOString(),
        end: usage.periodEnd.toISOString(),
      },
    };
  }
}

export class BoostCardDTO {
  id?: string;
  cardId?: string;
  userId?: string;
  duration?: number;
  startDate?: string;
  endDate?: string;
  status?: string;
  impressions?: number;
  clicks?: number;
  createdAt?: string;

  static fromEntity(boost: BoostCard): BoostCardDTO {
    return {
      id: boost.id,
      cardId: boost.cardId,
      userId: boost.userId,
      duration: boost.duration,
      startDate: boost.startDate.toISOString(),
      endDate: boost.endDate.toISOString(),
      status: boost.status,
      impressions: boost.impressions,
      clicks: boost.clicks,
      createdAt: boost.createdAt.toISOString(),
    };
  }

  static fromEntities(boosts: BoostCard[]): BoostCardDTO[] {
    return boosts.map((boost) => BoostCardDTO.fromEntity(boost));
  }
}
